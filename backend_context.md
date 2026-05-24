# WanderVN - Backend Context & ZaloPay Integration Plan

> [!NOTE]
> Tài liệu này mô tả chi tiết kiến trúc của WanderVN Backend (ASP.NET Core 8.0) và thiết lập tài liệu hướng dẫn kỹ thuật cho tính năng tích hợp cổng thanh toán **ZaloPay** dựa trên mã nguồn thực tế hiện tại.
> Agent mới vào conversation có thể đọc file này để nắm bắt lập tức cấu trúc dự án và quy trình thanh toán.

---

## 1. Tổng quan Kiến trúc Backend (ASP.NET Core Web API)

Hệ thống Backend được tổ chức theo mô hình **Clean Architecture** chia thành 4 layer chính trong Solution `WanderVN.sln`:

1. **`WanderVN.Domain`**:
   - Chứa các thực thể cốt lõi (`Bookings`, `Payments`, `Users`, v.v.).
   - Định nghĩa Interface Repository cơ bản: `IGenericRepository<T>` và `IUnitOfWork`.
   - Hoàn toàn độc lập với các thư viện bên ngoài.
2. **`WanderVN.Application`**:
   - Nơi chứa logic nghiệp vụ thuần túy, áp dụng pattern **CQRS** (Command Query Responsibility Segregation) thông qua **MediatR**.
   - Phân chia các thư mục nghiệp vụ rõ ràng: `Features/{Domain}/{Commands|Queries}`.
   - Định nghĩa các interface giao tiếp nghiệp vụ trong `Common/Interfaces` (như `IApplicationDbContext`, `IVNPayService`, `IDuffelService`, v.v.).
   - Áp dụng **FluentValidation** để xác thực dữ liệu đầu vào.
   - **Quy tắc quan trọng**: KHÔNG ĐƯỢC phép gọi trực tiếp `DbContext` ở tầng Application cho các Query Handler hoặc Command Handler. Tất cả tương tác ghi phải qua `IUnitOfWork`, và tương tác đọc qua các Interface Repository cụ thể.
3. **`WanderVN.Infrastructure`**:
   - Hiện thực hóa (implement) các interface từ tầng Application và Domain.
   - Cung cấp `WanderVNDbContext` thừa kế `IApplicationDbContext`.
   - Triển khai các dịch vụ tích hợp bên ngoài (VNPayService, DuffelService, NominatimGeocodingService, EmailService).
   - Đăng ký DI trong `DependencyInjection.cs`.
4. **`WanderVN.API`**:
   - Entry point của Web API, chứa các Controller (`api/v1/{resource}`).
   - Cấu hình Middleware xử lý ngoại lệ toàn cục (`ExceptionMiddleware`), JWT Authentication và Swagger.
   - Quản lý cấu hình tại `appsettings.json` và User Secrets ở local.

---

## 2. Chiến lược Tương tác Dữ liệu & Quy đổi tiền tệ

- **EF Core (`WanderVNDbContext`)**: Chuyên xử lý các tác vụ **Ghi/Cập nhật (CUD)** để đảm bảo tính toàn vẹn dữ liệu thông qua Unit of Work và Repository Pattern.
- **Dapper & Stored Procedures**: Chuyên xử lý tác vụ **Đọc (Query)** hiệu năng cao (như tìm kiếm khách sạn, lọc giá phòng phức tạp).
- **Bộ chuyển đổi tiền tệ (`CurrencyConverter.cs`)**:
  - Chuyến bay được Duffel API tính bằng USD, tuy nhiên các cổng thanh toán Việt Nam (VNPay, ZaloPay) bắt buộc giao dịch bằng **VND**.
  - Hệ thống sử dụng tỷ giá quy đổi cố định: **1 USD = 26,500 VND** (`CurrencyConverter.UsdToVndRate = 26500m`).
  - Phương thức `ConvertUsdToVnd(decimal usdAmount)` thực hiện quy đổi và làm tròn số tiền trước khi truyền sang cổng thanh toán.

---

## 3. Kiến trúc Cổng thanh toán VNPay hiện tại

Hệ thống thanh toán VNPay đã được xây dựng hoàn chỉnh và chạy thực tế, làm chuẩn mẫu để tích hợp ZaloPay:

- **API Endpoint (`PaymentsController.cs`)**:
  - `POST api/v1/payments/create-vnpay-url`: Nhận `BookingId`, sinh địa chỉ IP của Client và gọi `CreateVNPayUrlCommand` để tạo link thanh toán VNPay Sandbox.
  - `GET api/v1/payments/vnpay-ipn`: Nhận phản hồi IPN trực tiếp từ server VNPay, trích xuất query và gọi `ProcessVNPayIpnCommand`. Trả về dữ liệu thô dạng JSON `{"RspCode": "...", "Message": "..."}` để phản hồi chính xác cho VNPay.
- **Tầng Application (`Application/Features/Payments`)**:
  - **CreateVNPayUrl**: Kiểm tra trạng thái Booking, chuyển đổi giá trị USD sang VND thông qua `CurrencyConverter` và tạo chữ ký SHA512 với `vnp_HashSecret`.
  - **ProcessVNPayIpn**: Xác thực chữ ký phản hồi qua `IVNPayService`, kiểm tra số tiền khớp với hóa đơn quy đổi (tránh lỗi khai khống), kiểm tra trạng thái Paid trước đó (tránh Double Confirm), cập nhật trạng thái `Paid` (Booking) và lưu lịch sử giao dịch vào bảng `Payments`.
- **Tầng Infrastructure (`Infrastructure/Services/VNPayService.cs`)**:
  - Triển khai thuật toán băm HMAC-SHA512 để tạo secure hash của VNPay từ chuỗi tham số sắp xếp theo bảng chữ cái Alphabet.

---

## 4. Thiết kế Tích hợp Cổng thanh toán ZaloPay

Dựa trên tài liệu ZaloPay Sandbox và thông tin được cung cấp từ `local_data/zalopay_email_info.md`:

### A. Thông tin tài khoản Sandbox ZaloPay
- **AppID**: `2554`
- **Key1**: `sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn` (dùng để tạo chữ ký yêu cầu gửi đi)
- **Key2**: `trMrHtvjo6myautxDUiAcYsVtaeQ8nhf` (dùng để xác thực chữ ký phản hồi từ ZaloPay qua Callback)
- **Tài liệu tham khảo**: [ZaloPay Integration Guides](https://docs.zalopay.vn/docs/guides/intro/)

### B. Các bước triển khai Backend cụ thể

1. **Cấu hình appsettings.json**:
   ```json
   "ZaloPay": {
     "AppId": "2554",
     "Key1": "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
     "Key2": "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
     "BaseUrl": "https://sb-openapi.zalopay.vn/v2/create",
     "CallbackUrl": "https://your-public-domain.ngrok-free.app/api/v1/payments/zalopay-callback",
     "RedirectUrl": "http://localhost:5173/payment/zalopay-return"
   }
   ```
   *(Lưu ý: CallbackUrl cần là một địa chỉ IP/Domain công khai hỗ trợ HTTPS như ngrok để ZaloPay Server có thể gửi Webhook).*

2. **Tạo Interface `IZaloPayService`** (`WanderVN.Application/Common/Interfaces`):
   ```csharp
   public interface IZaloPayService
   {
       Task<string> CreatePaymentUrlAsync(int bookingId, decimal amount, string embedData, string item);
       bool ValidateCallback(string data, string requestMac);
   }
   ```

3. **Cài đặt `ZaloPayService`** (`WanderVN.Infrastructure/Services`):
   - Sử dụng thuật toán băm **HMAC-SHA256** với `Key1` và `Key2`.
   - Sinh `app_trans_id` theo định dạng bắt buộc của ZaloPay: `yyMMdd_xxxxxx` (ví dụ `260523_bookingid_ticks`).
   - Xây dựng dữ liệu JSON cho `embed_data` (chứa URL chuyển hướng `redirecturl` sau khi thanh toán xong) và `item`.
   - Chuỗi dữ liệu ký (data) để tạo `mac` khi tạo đơn hàng:
     `app_id + "|" + app_trans_id + "|" + app_user + "|" + amount + "|" + app_time + "|" + embed_data + "|" + item`

4. **Tạo CQRS Commands** (`WanderVN.Application/Features/Payments`):
   - **`CreateZaloPayUrl`**: Lấy thông tin đơn hàng, kiểm tra tính hợp lệ, quy đổi USD sang VND, tạo yêu cầu và trả về link thanh toán `order_url` của ZaloPay.
   - **`ProcessZaloPayCallback`**: Nhận Webhook từ ZaloPay, giải mã và xác thực chữ ký (mac) bằng `Key2` trên chuỗi dữ liệu nhận được. Cập nhật trạng thái `Paid` cho đơn hàng và ghi nhận lịch sử vào bảng `Payments`. Trả về JSON xác nhận thành công cho ZaloPay: `{"return_code": 1, "return_message": "success"}`.

5. **Mở rộng API Endpoint (`PaymentsController.cs`)**:
   - Thêm `POST api/v1/payments/create-zalopay-url`
   - Thêm `POST api/v1/payments/zalopay-callback` (ZaloPay gửi callback qua HTTP POST)

---

## 5. Thiết kế Thay đổi phía Frontend

Để tích hợp phương thức thanh toán mới trên giao diện:

1. **`Frontend/src/services/client/paymentService.ts`**:
   - Bổ sung hàm API giao tiếp với endpoint của ZaloPay:
     ```typescript
     async createZaloPayUrl(req: { bookingId: number }): Promise<string> {
       return request<string>('/payments/create-zalopay-url', {
         method: 'POST',
         body: JSON.stringify(req),
       });
     }
     ```

2. **`Frontend/src/pages/client/FlightCheckout.tsx`**:
   - Thêm tùy chọn ZaloPay vào danh sách phương thức thanh toán (`paymentMethod` state nâng cấp kiểu dữ liệu thành `'vnpay' | 'zalopay' | 'momo' | 'credit'`).
   - Giao diện HTML của phương thức ZaloPay (tại dòng 264-321):
     ```tsx
     {/* ZaloPay Option */}
     <label
       onClick={() => setPaymentMethod('zalopay')}
       className={`group flex items-center justify-between p-5 border transition-all cursor-pointer rounded-lg ${paymentMethod === 'zalopay'
         ? 'border-primary bg-surface shadow-md'
         : 'border-outline-variant/30 hover:border-primary bg-transparent'
         }`}
     >
       <div className="flex items-center gap-4">
         <input
           type="radio"
           name="payment"
           checked={paymentMethod === 'zalopay'}
           onChange={() => setPaymentMethod('zalopay')}
           className="text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer animate-none"
         />
         <div className="flex flex-col">
           <span className="font-label-md text-label-md">Ví điện tử ZaloPay</span>
           <span className="text-[11px] text-on-surface-variant opacity-75">Thanh toán nhanh gọn bằng ví điện tử ZaloPay</span>
         </div>
       </div>
       <div className="flex gap-2 opacity-50 group-hover:opacity-80 transition-all text-on-surface">
         <Wallet className="h-6 w-6" />
       </div>
     </label>
     ```
   - Cập nhật xử lý submit (`handleBookingSubmit`):
     ```typescript
     if (paymentMethod === 'zalopay') {
       const paymentUrl = await paymentService.createZaloPayUrl({ bookingId: result.bookingId });
       if (paymentUrl) {
         window.location.href = paymentUrl;
         return;
       }
     }
     ```
