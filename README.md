# WanderVN - Nền Tảng Du Lịch Trực Tuyến Toàn Diện (All-in-one Travel Platform)

WanderVN là một nền tảng du lịch trực tuyến (OTA - Online Travel Agency) hiện đại, cho phép người dùng tìm kiếm, đặt chỗ và thanh toán trực tuyến các dịch vụ du lịch như khách sạn và chuyến bay. 

Dự án được xây dựng với mục tiêu mang đến trải nghiệm tìm kiếm và đặt dịch vụ du lịch chuẩn mực, đồng thời đóng vai trò như một hệ thống thực hành các kỹ thuật phát triển phần mềm nâng cao như **Clean Architecture**, **CQRS**, xử lý bất đồng bộ, thanh toán trực tuyến, quản lý đối tác và tối ưu hóa hiệu năng dữ liệu.

---

## 🚀 Chức Năng Chính

### 1. Phân Hệ Khách Hàng (Customer & Guest)
* **Tìm kiếm & Đặt Phòng Khách Sạn**:
  * Tìm kiếm thông minh theo cây địa điểm phân cấp (Tỉnh/Thành phố → Quận/Huyện → Khu vực/Điểm du lịch) thông qua truy vấn **Recursive CTE** trên SQL Server (giống cơ chế hoạt động của Traveloka).
  * Xem thông tin phòng trống theo thời gian thực, giá bán và đặt phòng.
* **Tìm kiếm & Đặt Vé Máy Bay**:
  * Tìm kiếm chuyến bay theo thời gian thực (real-time) kết nối trực tiếp với **Duffel API**.
  * Hỗ trợ tìm kiếm và đặt vé cho nhiều hành khách cùng lúc (Người lớn, Trẻ em, Em bé) với cơ chế liên kết hành khách đi kèm (infant accompanying adult).
* **Trải Nghiệm Thanh Toán & Đặt Chỗ Vãng Lai**:
  * Cho phép đặt chỗ 100% không cần tài khoản (Guest Booking), quản lý thông tin liên hệ trực tiếp trên đơn đặt.
  * Tích hợp cổng thanh toán trực tuyến **VNPay** và **ZaloPay**.
  * **Bộ đếm thời gian giữ vé (Checkout Timer)**: Countdown 15 phút bảo vệ phiên giữ giá vé máy bay từ Duffel API, cảnh báo thông minh khi sắp hết hạn.
  * **Trang Tra Cứu Đơn Hàng (Universal Booking Lookup)**: Giao diện Cinematic Editorial Minimalism, cho phép tra cứu đơn đặt bằng Mã đặt chỗ và Email để thanh toán lại, hủy đơn hoặc thực hiện Check-out/Check-in trực tiếp.

### 2. Phân Hệ Đối Tác (Partner Portal)
* **Đăng Ký & Quản Lý Cơ Sở Lưu Trú**: Đăng ký trở thành đối tác lưu trú, tự chủ quản lý thông tin khách sạn, hình ảnh, tiện ích, loại phòng và cấu hình giá bán.
* **Trang Tài Chính Đối Tác (Partner Finance Dashboard)**:
  * Giao diện Limestone-themed cao cấp hiển thị trực quan các chỉ số tài chính thời gian thực (Tổng doanh thu Gross, Phí hoa hồng Commission, Doanh thu thuần Net).
  * Quản lý các đợt đối soát tài chính theo nhóm (**Payout Batches**) giúp đối soát minh bạch thay vì rút tiền lẻ tẻ từng đơn hàng.
  * Tỷ lệ hoa hồng được lấy động từ cấu hình hệ thống (`SystemSettings`).

### 3. Phân Hệ Quản Trị Viên (Admin Panel)
* **Quản Lý Hệ Thống**: Phê duyệt tài khoản đối tác mới, quản lý thông tin người dùng và giám sát các cơ sở lưu trú.
* **Đối Soát & Chi Trả Hàng Loạt (Admin Payout Batches)**:
  * Quản lý vòng đời chi trả cho đối tác.
  * Cho phép gom nhóm nhiều yêu cầu thanh toán đơn lẻ thành một đợt chi trả (`PayoutBatches`) để xác nhận chuyển khoản ngân hàng hàng loạt (bulk confirmation), ghi nhận thông tin tham chiếu giao dịch.
* **Quản Lý Cấu Hình Hệ Thống**: Điều chỉnh động các thông số như tỷ lệ hoa hồng (`CommissionFee`), thời gian giữ chỗ chưa thanh toán (`UnpaidBookingExpirationMinutes`), thời gian ân hạn đối soát (`PayoutGracePeriodHours`).

---

## 🏛️ Kiến Trúc Hệ Thống & Thiết Kế

Dự án tuân thủ chặt chẽ nguyên lý **Clean Architecture** kết hợp với mẫu thiết kế **CQRS (Command Query Responsibility Segregation)** nhằm tối ưu hóa hiệu năng và khả năng bảo trì.

### 1. Cấu Trúc Dự Án (Backend)
Backend được tổ chức thành 4 phân lớp rõ ràng trong solution `WanderVN.sln`:
* **`WanderVN.Domain`**: Chứa các Entity cốt lõi, Value Objects, Enums chuẩn hóa (`BookingStatus`, `BookingPaymentStatus`, `BookingServiceType`) và các Repository Interfaces. Hoàn toàn độc lập với các framework bên ngoài.
* **`WanderVN.Application`**: Chứa logic nghiệp vụ thuần túy. Sử dụng **MediatR** để dispatch các Command/Query và **FluentValidation** để xác thực dữ liệu đầu vào.
* **`WanderVN.Infrastructure`**: Hiện thực hóa việc lưu trữ dữ liệu và tích hợp bên thứ ba (EF Core DbContext, Dapper Repositories, dịch vụ cache Redis, VNPay/ZaloPay API, Duffel Client).
* **`WanderVN.API`**: RESTful API endpoints (`/api/v1/...`), cấu hình Swagger, Middleware xử lý ngoại lệ toàn cục (`ExceptionMiddleware` hỗ trợ UTF-8 tiếng Việt và bảo mật thông tin chi tiết lỗi), và thiết lập JWT Authentication.

```text
Backend
├── WanderVN.API            # RESTful API & Cấu hình Kestrel, JWT, Middleware
├── WanderVN.Application    # Core Business Logic, CQRS Commands/Queries, DTOs
├── WanderVN.Domain         # Domain Entities, Enums, Interfaces cốt lõi
└── WanderVN.Infrastructure # EF Core, Dapper, Redis Cache, Duffel API, VNPay/ZaloPay
```

### 2. Chiến Lược Truy Cập Dữ Liệu Lai (Hybrid Data Access)
Để cân bằng giữa tốc độ phát triển và hiệu năng truy vấn, WanderVN áp dụng chiến lược Hybrid:
* **Entity Framework Core (Write/CUD Path)**: Sử dụng cho các thao tác Thêm, Sửa, Xóa nhằm tận dụng tính năng theo dõi trạng thái (Change Tracking), quản lý giao dịch lồng nhau (Nested Transactions) và bảo toàn tính toàn vẹn dữ liệu.
* **Dapper & Stored Procedures (Read Path)**: Sử dụng cho các truy vấn đọc dữ liệu phức tạp hoặc yêu cầu hiệu năng cao (như tìm kiếm khách sạn, xem lịch sử đặt chỗ `GetBookingHistoryAsync` qua câu lệnh `UNION ALL` tối ưu). Logic SQL nặng được đẩy trực tiếp xuống SQL Server xử lý qua Stored Procedures.

### 3. Cơ Chế Xử Lý Background Services (Bất Đồng Bộ)
* **`UnpaidBookingExpirationBackgroundService`**: Chạy ngầm định kỳ quét các đơn đặt phòng/vé ở trạng thái `Pending` quá hạn thanh toán (mặc định 30 phút). Tự động hủy đơn hàng và giải phóng phòng khách sạn lại vào kho phòng trống để tránh giam giữ phòng ảo.
* **`BookingSettlementBackgroundService`**: Tự động hóa luồng đối soát tài chính. Khi khách hàng hoàn tất Check-out và qua thời gian ân hạn đối soát (Grace Period), hệ thống sẽ tự động tính toán phí hoa hồng và tạo bản ghi Payout ở trạng thái `Pending` cho đối tác.

### 4. Hệ Thống Cache Tìm Kiếm Vé Máy Bay (Redis Cache & Fallback)
* Tích hợp dịch vụ cache phân tán **Redis** qua `IDistributedCache` để lưu trữ kết quả tìm kiếm chuyến bay từ Duffel API, giúp giảm thiểu số lượng request và tránh bị giới hạn băng thông (Rate Limit).
* Cấu hình phân tách cache theo Session ID (`X-Session-ID` header) để tránh xung đột Offer ID giữa các người dùng khác nhau.
* Thiết kế chế độ dự phòng an toàn (**Resilient Fallback**): Tự động chuyển sang `NoOpFlightSearchCacheService` nếu không có cấu hình Redis mà không làm gián đoạn hệ thống.

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
* **Core**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v3 (sử dụng hệ thống token chuẩn của dự án)
* **Animation & Motion**: **GSAP Core** (GreenSock Animation Platform) cho hiệu ứng chuyển trang mượt mà, hỗ trợ khả năng cấu hình giảm chuyển động (`prefers-reduced-motion`) bảo vệ người dùng nhạy cảm.
* **Libraries**: React Router v6, Lucide React (Icons), Axios, Date-fns.

### Backend
* **Core**: ASP.NET Core 8.0 Web API
* **ORM**: Entity Framework Core 8.0
* **Micro-ORM**: Dapper 2.0
* **CQRS**: MediatR 12.0
* **Validation**: FluentValidation
* **Security**: JWT Bearer Authentication, .NET User Secrets (cô lập cấu hình API Keys cục bộ), bảo vệ chống lỗ hổng IDOR thông qua `ICurrentUserService`.

### Database & Caching
* Microsoft SQL Server
* Redis Cache

### Cổng Thanh Toán & Dịch Vụ Ngoài
* VNPay Sandbox
* ZaloPay Sandbox
* Duffel API Client v2 (Flight Engine)

---

## 💻 Hướng Dẫn Chạy Dự Án

### 1. Chuẩn Bị Môi Trường
* Cài đặt **.NET 8.0 SDK**.
* Cài đặt **Node.js** (Phiên bản v18 trở lên khuyến nghị).
* Cài đặt **SQL Server** và **Redis** (Nếu sử dụng tính năng flight cache).

### 2. Cấu Hình Backend
Vào thư mục `/Backend` và cấu hình User Secrets để tránh lộ thông tin nhạy cảm:
```bash
cd Backend
dotnet user-secrets set "Duffel:AccessToken" "YOUR_DUFFEL_ACCESS_TOKEN" -p WanderVN.API/WanderVN.API.csproj
```
Cập nhật chuỗi kết nối cơ sở dữ liệu `DefaultConnection` và cấu hình Redis trong `appsettings.Development.json`.

Khởi động dự án Backend:
```bash
dotnet restore
dotnet run --project WanderVN.API
```
* API Swagger chạy tại địa chỉ mặc định: `http://localhost:5096/swagger`

### 3. Cấu Hình Frontend
Vào thư mục `/Frontend` và tiến hành cài đặt dependencies:
```bash
cd Frontend
npm install
npm run dev
```
* Trang web chạy tại địa chỉ mặc định: `http://localhost:5173`

---

## 🛡️ Triển Khai & CI/CD

Dự án tích hợp luồng tự động hóa triển khai **CI/CD bằng GitHub Actions** lên máy chủ hosting IIS của Somee.com.

* **Giải quyết xung đột ghi đè tệp**: Pipeline tự động tạo và tải lên tệp `app_offline.htm` trước khi deploy qua FTP nhằm giải phóng hoàn toàn các file khóa hệ thống (DLL lock) trên IIS, sau đó tự động xóa tệp này để kích hoạt ứng dụng hoạt động trở lại sau khi upload hoàn tất.
* **Các GitHub Secrets cần thiết**:
  * `SOMEE_FTP_SERVER`
  * `SOMEE_FTP_USERNAME`
  * `SOMEE_FTP_PASSWORD`
  * `APPSETTINGS_PRODUCTION_JSON`
