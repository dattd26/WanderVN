# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- **GSAP Animations on SearchStays Page**: Tích hợp các hiệu ứng chuyển cảnh và xuất hiện so le (stagger animations) bằng thư viện GSAP cho trang tìm kiếm khách sạn.
  - **Why it changed**: Cải thiện trải nghiệm người dùng (UX) theo phong cách tối giản biên tập (Editorial Minimalism), tăng tính tương tác sinh động khi tải trang và khi bộ lọc thay đổi danh sách hiển thị.
  - **Affected files**: [SearchStays.tsx](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/pages/client/SearchStays.tsx), [FiltersSidebar.tsx](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/components/client/FiltersSidebar.tsx).
  - **What changed**:
    - Sử dụng `gsap.matchMedia()` để tạo hiệu ứng so le mượt mà cho tiêu đề trang, ô tìm kiếm và sidebar bộ lọc khi bắt đầu truy cập.
    - Lắng nghe trạng thái `loading` để kích hoạt hiệu ứng stagger slide-up cho danh sách thẻ khách sạn (`HotelCard`) sau khi gọi API xong.
    - Hỗ trợ đầy đủ `prefers-reduced-motion` để tự động tắt hoặc tối giản hiệu ứng khi người dùng bật chế độ giảm chuyển động trên thiết bị.
    - Mở rộng prop `className` cho `FiltersSidebar` để truyền và nhận các lớp CSS hoạt ảnh một cách trực quan.

### Fixed
- **Lỗi hiển thị gợi ý khách sạn khi đặt vé máy bay trên Chatbot (Chatbot Flight Search Intent & URL Parser)**: Khắc phục lỗi chatbot tự động hiển thị danh sách khách sạn và gợi ý khách sạn khi người dùng yêu cầu đặt vé máy bay, đồng thời nâng cấp bộ phân tích tham số tìm kiếm chuyến bay từ lịch sử hội thoại.
  - **Why it changed**:
    1. Khi người dùng yêu cầu đặt vé máy bay (ví dụ: "đặt vé máy bay từ sài gòn đến đà nẵng"), chatbot tự động phân tích địa điểm đến làm vị trí tìm khách sạn, dẫn đến việc gợi ý khách sạn đè lên và hiển thị kèm theo nút tìm chuyến bay gây nhầm lẫn.
    2. Bộ trích xuất link tìm kiếm chuyến bay trước đây chỉ phân tích tin nhắn cuối cùng và phản hồi của AI, làm mất dấu thông tin địa điểm và ngày đi/về nếu cuộc đối thoại diễn ra qua nhiều lượt (multi-turn conversation).
  - **Affected files**: [ChatbotService.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Infrastructure/Services/ChatbotService.cs).
  - **What changed**:
    - Bổ sung hàm `IsFlightRequest` để nhận diện chính xác yêu cầu về chuyến bay của người dùng từ tin nhắn và lịch sử trò chuyện.
    - Bỏ qua việc tìm kiếm khách sạn và hiển thị badge gợi ý khách sạn khi người dùng đang thực hiện yêu cầu tìm/đặt vé máy bay.
    - Cập nhật `BuildSystemPrompt` để hướng dẫn Gemini tập trung tư vấn chuyến bay thay vì khách sạn khi phát hiện intent tìm chuyến bay.
    - Nâng cấp `ExtractFlightSearchUrl` và `ExtractAirportCode` để quét toàn bộ lịch sử hội thoại của người dùng, phân tích chi tiết các tham số tìm kiếm bao gồm: mã sân bay đi/đến (hỗ trợ phân tích theo thứ tự và ngữ cảnh "từ/đến"), ngày đi/về (hỗ trợ khứ hồi), số lượng khách (phân tách người lớn, trẻ em, em bé), hạng ghế (thương gia/phổ thông), loại hành trình (khứ hồi/một chiều), và sinh URL đầy đủ chính xác.

- **Lỗi tạo đơn đặt phòng khách sạn (Create Hotel Booking Room Status & Email Mismatch)**: Khắc phục lỗi khi đặt phòng khách sạn bị từ chối do kiểm tra trạng thái phòng tĩnh ("Available") và sửa lỗi hiển thị sai tiền tệ trong email xác nhận.
  - **Why it changed**:
    1. Trước đây, hệ thống tìm phòng trống bằng cách kiểm tra cột `Status == "Available"` trên bảng `Rooms`. Nếu phòng đó đã có một booking vào thời gian khác (khiến status phòng chuyển sang "Booked"), hệ thống sẽ báo hết phòng và từ chối đặt phòng dù khoảng thời gian mới hoàn toàn trống.
    2. Email xác nhận đặt phòng khách sạn bị hardcode tiền tệ là USD và hiển thị kí hiệu `$` ở đầu, trong khi giá phòng thực tế lưu và thanh toán bằng VNĐ.
    3. Trình thu hồi phòng chưa thanh toán (`UnpaidBookingExpirationBackgroundService`) sử dụng thời gian hết hạn mặc định là 1 phút thay vì 30 phút nếu cấu hình chưa được seed vào DB, dẫn đến các booking mới tạo bị hủy ngay lập tức.
  - **Affected files**: [CreateHotelBookingCommandHandler.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Features/Bookings/Commands/CreateHotelBooking/CreateHotelBookingCommandHandler.cs), [UnpaidBookingExpirationBackgroundService.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Infrastructure/Services/UnpaidBookingExpirationBackgroundService.cs), [WanderVNDbContext.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Infrastructure/Data/WanderVNDbContext.cs).
  - **What changed**:
    - Thay đổi logic tìm phòng khả dụng trong `CreateHotelBookingCommandHandler` sang kiểm tra trùng lặp lịch đặt phòng (date overlapping check) thực tế dựa trên ngày nhận/trả phòng và trạng thái các booking khác thay vì kiểm tra cột `Status` tĩnh.
    - Bổ sung logic lấy thông tin người dùng đăng nhập làm fallback nếu thông tin liên hệ từ request bị thiếu để tránh lỗi lưu DB và giúp tra cứu thuận tiện.
    - Sửa định dạng giá tiền hiển thị trong email xác nhận đặt phòng sang `{totalPrice:N0} VND`.
    - Tăng thời gian giữ phòng chờ thanh toán mặc định của background service (`DefaultExpirationMinutes`) lên 30 phút.
    - Khai báo kiểu dữ liệu cột `decimal(18, 2)` cho các trường `DuffelAmountVnd`, `MarkupAmountVnd` và `PaymentFeeVnd` trong `WanderVNDbContext` để dập tắt cảnh báo từ EF Core.

- **Status Badge & Booking History Filtering**: Sửa logic hàm `renderStatusBadge` và bộ lọc tab lịch sử để hỗ trợ chính xác tất cả các trạng thái trong enum `BookingStatus` của backend (Pending, Confirmed, Completed, Cancelled, SettlementPending, Settled, CheckedIn, CheckedOut, NoShow).
  - **Why it changed**: Trước đây logic status badge ở frontend bị sai lệch so với enum backend (như dùng status giả lập `'Paid'`), dẫn đến các booking có trạng thái `Confirmed` rơi vào nhánh fallback hiển thị sai lệch thông tin thành "Đang xử lý" hoặc "Đã thanh toán / Chờ duyệt" và không hiển thị đúng nút Check-out.
  - **Affected files**: [BookingHistory.tsx](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/pages/client/BookingHistory.tsx), [BookingLookup.tsx](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/pages/client/BookingLookup.tsx), [BookingDetail.tsx](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/pages/client/BookingDetail.tsx).
  - **What changed**:
    - Đồng bộ `renderStatusBadge` trên cả 3 trang sử dụng cấu trúc `switch-case` chuẩn hóa đầy đủ 9 trạng thái.
    - Sửa logic đếm số lượng (`tabCounts`) và lọc đơn đặt (`filteredBookings`) trong các tab (Sắp đi, Đã trải nghiệm, Đã hủy) để phân loại chính xác các trạng thái nghiệp vụ mới (`CheckedIn`, `CheckedOut`, `Settled`, `SettlementPending`, `NoShow`).
    - Sửa điều kiện ẩn/hiển thị nút check-out và cancel ở trang chi tiết theo trạng thái thực tế.

### Style 
• Đã style lại UI/UX cho các màn booking và dùng GSAP core cho entrance animation có prefers-reduced-motion:

  - Cập nhật BookingHistory.tsx, BookingDetail.tsx, BookingLookup.tsx.
  - Đồng bộ lại 2 card con HotelBookingCard.tsx, FlightBookingCard.tsx vì BookingHistory render qua chúng.
  - Chuẩn hóa màu label/status: emerald cho paid/upcoming, sky cho completed, rose cho cancelled, secondary cho pending.
  - Bỏ nhiều hardcode màu lẫn tông (#FAF9F6, amber/gray/red rời rạc), thay bằng token Tailwind của project.
  - Thêm gsap vào package.json và package-lock.json.
### Added
- **Multiple Passengers Flight Booking**: Cập nhật backend API tìm kiếm vé máy bay để hỗ trợ nhập số lượng nhiều hành khách thay vì chỉ 1 loại như trước đây.
  - **Why it changed**: Cho phép người dùng tìm kiếm và đặt vé máy bay cho nhiều người lớn, trẻ em, và em bé trong cùng một chuyến bay.
  - **Affected files**: `SearchFlightsQuery.cs`, `DuffelOfferRequestDto.cs`, `SearchFlightsQueryHandler.cs`, `DuffelService.cs`, `FlightSearchCacheService.cs`.
  - **What changed**:
    - Thay thế tham số `PassengerType` (string) thành 3 tham số đếm: `AdultCount`, `ChildCount`, `InfantCount` trong DTO.
    - Cập nhật logic ánh xạ và sinh payload yêu cầu gửi sang Duffel API.
    - Sửa lại khóa (key) lưu cache trong Redis tương ứng với các thay đổi DTO.

### Fixed
- **Lỗi Duffel Order "Confirmed" khi đơn hàng chưa được thanh toán**: Sửa lỗi xuất vé ngay lập tức khi tạo đơn đặt chuyến bay trên Duffel API.
  - **Why it changed**: Trước đây hệ thống gửi yêu cầu tạo order `type = "instant"` và thanh toán luôn bằng balance của Duffel khi user vừa mới khởi tạo booking. Việc này khiến vé được xuất và Duffel trừ tiền ngay lập tức dù user vẫn chưa trả tiền qua VNPay / ZaloPay.
  - **Affected files**: `CreateFlightBookingCommandHandler.cs`, `ProcessVNPayIpnCommandHandler.cs`, `ProcessZaloPayCallbackCommandHandler.cs`, `IDuffelService.cs`, `DuffelService.cs`.
  - **What changed**:
    - Thay đổi quá trình tạo đơn hàng Duffel thành `type = "hold"` và gỡ bỏ phần `payments`.
    - Bổ sung hàm `PayOrderAsync` vào `IDuffelService` để gọi API `/air/payments` của Duffel.
    - Chèn logic gọi `PayOrderAsync` vào các Webhook Callback (`ProcessVNPayIpnCommandHandler` và `ProcessZaloPayCallbackCommandHandler`) ngay khi thanh toán qua ví điện tử VNPay/ZaloPay báo thành công, lúc này mới chính thức thanh toán cho Duffel để xuất vé.

### Fixed
- **Lỗi Duffel 422 Unprocessable Entity khi đặt vé cho nhiều hành khách (Passenger date of birth mismatch & Infant accompanying adult)**: Sửa lỗi khi gửi thông tin đặt vé cho nhiều hành khách khác loại (Người lớn, Trẻ em, Em bé) bị Duffel API từ chối do trùng lặp ID hành khách hoặc em bé thiếu liên kết với người lớn đồng hành.
  - **Why it changed**: 
    1. Khi khởi tạo danh sách hành khách ở trang Checkout phía Frontend, việc sử dụng vòng lặp từ 0 khiến các hành khách đầu tiên của từng nhóm (Người lớn, Trẻ em, Em bé) đều nhận chỉ số `index === 0`, dẫn đến việc bị gán cùng một `basePassengerId` của người lớn đầu tiên. Duffel API nhận diện trùng ID và lỗi lệch ngày sinh so với loại hành khách tương ứng trong Offer.
    2. Duffel API yêu cầu mỗi hành khách em bé (`infant_without_seat`) phải được liên kết với một hành khách người lớn đồng hành thông qua trường `infant_passenger_id` trong đối tượng của người lớn.
  - **Affected files**: [flight.ts](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/types/client/flight.ts), [FlightCheckoutContext.tsx](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/components/client/checkout/FlightCheckoutContext.tsx), [DuffelOrderRequestDto.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/DTOs/Request/DuffelOrderRequestDto.cs), [CreateFlightBookingCommandHandler.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Features/Bookings/Commands/CreateFlightBooking/CreateFlightBookingCommandHandler.cs).
  - **What changed**:
    - Cập nhật định nghĩa TypeScript `FlightOfferDto` và bổ sung `FlightOfferPassengerDto` để chứa danh sách hành khách trả về từ Backend.
    - Sửa logic khởi tạo hành khách trong `FlightCheckoutContext.tsx`: Ánh xạ động từng hành khách nhập vào với đúng ID hành khách tương ứng theo loại từ danh sách hành khách của ưu đãi Duffel (`duffelAirwaysPassengers` / `passengers`), tránh bị trùng lặp ID hoặc sai lệch loại hành khách.
    - Bổ sung trường `infant_passenger_id` vào `DuffelPassengerDto` phía Backend.
    - Cập nhật `CreateFlightBookingCommandHandler.cs` để phân tích danh sách loại hành khách từ Duffel Offer chi tiết, sau đó liên kết từng em bé với một người lớn đồng hành tương ứng bằng cách thiết lập trường `infant_passenger_id` cho hành khách người lớn trước khi gửi yêu cầu tạo order lên Duffel API.

- **Flight Search Cache Mismatch & DTO Compilation**: Sửa lỗi cache trả về dữ liệu cũ bị thiếu thông tin hành khách khi người dùng thay đổi dữ liệu/loại hành khách tìm kiếm.
  - **Why it changed**: Cache key trước đây chỉ dựa vào số lượng hành khách mà không có danh sách chi tiết các loại hành khách, dẫn đến xung đột cache khi thay đổi loại hành khách. Ngoài ra sửa lỗi biên dịch DTO hành khách do nhầm lẫn giữa `FlightPassengerInfoDto` và `FlightOfferPassengerDto`.
  - **Affected files**: `SearchFlightsQueryHandler.cs`, `DuffelOfferRequestDto.cs`, `DuffelService.cs`, `FlightSearchCacheService.cs`.
  - **What changed**:
    - Thêm `Passengers` list vào `DuffelOfferRequestDto` để giữ trọn vẹn danh sách hành khách đi kèm.
    - Cập nhật hàm sinh cache key `BuildKey` để mã hóa chuỗi các loại hành khách thay vì chỉ các con số số lượng đơn giản.
    - Sửa toàn bộ các tham chiếu `FlightPassengerInfoDto` lỗi biên dịch sang `FlightOfferPassengerDto` trong trình phân tích kết quả tìm kiếm.

### Refactored
- **Flight Offer Obsolete Properties Cleanup**: Completely removed deprecated properties `PassengerId` and `DuffelAirwaysPassengerId` from the flight offer DTO.
  - **Why it changed**: These fields were marked obsolete because the system now supports multiple passengers and maps details via the list properties `Passengers` and `DuffelAirwaysPassengers`. Removing them eliminates compilation warnings and keeps the API contract clean.
  - **Affected files**: [FlightOfferDto.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/DTOs/Response/FlightOfferDto.cs), [SearchFlightsQueryHandler.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Features/Flights/Queries/SearchFlights/SearchFlightsQueryHandler.cs), [flight.ts](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/types/client/flight.ts), [FlightCheckoutContext.tsx](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/components/client/checkout/FlightCheckoutContext.tsx), [FlightDetailModal.tsx](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Frontend/src/components/client/flight/FlightDetailModal.tsx).
  - **What changed**:
    - Deleted properties `PassengerId` and `DuffelAirwaysPassengerId` from `FlightOfferDto` (both backend C# and frontend TypeScript definitions).
    - Removed their assignments and related unused local variable `currentPassengerId` in `SearchFlightsQueryHandler.cs`.
    - Updated `FlightCheckoutContext.tsx` to resolve `basePassengerId` using the first element of the list of passengers.
    - Updated `FlightDetailModal.tsx` mapping to resolve `passengerId` from the passengers list.

- **Flight Booking Data Persistence & Architecture**: Refactored the flight details parsing and database saving logic in `CreateFlightBookingCommandHandler` into a dedicated application service `FlightBookingDataPersister`.
  - **Why it changed**: To follow Clean Architecture principles, reduce code bloating in the handler, ensure transaction-safe and memory-cached storage of Airline, Airport, Flight, and passenger seat assignments, and prevent EF Core change tracker pollution.
  - **Affected files**: [IFlightBookingDataPersister.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Common/Interfaces/IFlightBookingDataPersister.cs), [FlightBookingDataPersister.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Features/Bookings/Commands/CreateFlightBooking/FlightBookingDataPersister.cs), [CreateFlightBookingCommandHandler.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Features/Bookings/Commands/CreateFlightBooking/CreateFlightBookingCommandHandler.cs), [DependencyInjection.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Infrastructure/DependencyInjection.cs).
  - **What changed**:
    - Extracted flight details mapping into `IFlightBookingDataPersister` and its implementation `FlightBookingDataPersister`.
    - Implemented request-scoped dictionaries to cache Airlines, Airports, and Flights to avoid duplicate database lookups and redundant entity tracking.
    - Used EF navigation properties to delegate foreign key resolutions to EF Core, executing database persistence in a single `SaveChangesAsync` call.
    - Implemented passenger seat assignment parsing (`FindSeatNumber`) matching by Duffel passenger ID or passenger name (fallback).
    - Refactored `CreateFlightBookingCommandHandler` to inject the new persister and delegate the mapping, while keeping the minimal passenger fallback mechanism in case of errors.

### Optimized
- **Refactored Booking History Query to Dapper & Raw SQL**: Replaced the EF Core LINQ join queries in `GetBookingHistoryQueryHandler` with Dapper and a single high-performance `UNION ALL` SQL statement.
  - **Why it changed**: To follow codebase architecture standards prohibiting direct DbContext access inside Query Handlers, and to optimize the database query to execute in a single roundtrip.
  - **Affected files**: [IBookingRepository.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Common/Interfaces/IBookingRepository.cs), [BookingRepository.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Infrastructure/Repositories/BookingRepository.cs), [GetBookingHistoryQueryHandler.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Features/Bookings/Queries/GetBookingHistory/GetBookingHistoryQueryHandler.cs).
  - **What changed**:
    - Added `GetBookingHistoryAsync` signature to `IBookingRepository`.
    - Implemented `GetBookingHistoryAsync` in `BookingRepository` using Dapper and raw SQL with a UNION ALL query mapping to a private flat class `FlatBookingHistoryDto` before projecting to the nested structures.
    - Updated `GetBookingHistoryQueryHandler` to inject `IBookingRepository` instead of `IApplicationDbContext` and delegate execution directly to the repository method.

### Added
- **Nâng Cấp Trang Checkout Khách Sạn & Chuyến Bay**: Tái cấu trúc toàn diện 2 trang thanh toán theo chuẩn UX thực tế của các OTA (Online Travel Agency).
  - **Why it changed**: Giao diện cũ không phân tách rõ ràng các bước thông tin người đặt / khách lưu trú / hành khách, thiếu bảng chiết tính giá minh bạch, không có đồng hồ đếm ngược phiên giữ giá, và component cổng thanh toán bị lặp code.
  - **Affected files**: `HotelCheckout.tsx`, `FlightCheckout.tsx`, `CheckoutTimer.tsx` (new), `PaymentSelector.tsx` (new).
  - **What changed**:
    - **CheckoutTimer.tsx** (mới): Component đếm ngược 15 phút giữ giá vé máy bay. Hiển thị trạng thái warning (vàng, dưới 5 phút) và critical (đỏ, dưới 2 phút). Tự khóa nút đặt vé khi hết phiên.
    - **PaymentSelector.tsx** (mới): Component chọn cổng thanh toán dùng chung (VNPay, ZaloPay, MoMo tạm disabled, Thẻ tín dụng inline form). Loại bỏ trùng lặp logic giữa 2 trang.
    - **HotelCheckout.tsx**: Tái cấu trúc theo 4 bước tuần tự (01 Người đặt → 02 Khách lưu trú → 03 Yêu cầu đặc biệt → 04 Thanh toán). Layout 2 cột với sticky summary panel. Bổ sung bảng chiết tính giá (giá phòng × đêm + VAT 10%). Tích hợp chính sách hủy cố định "Huỷ miễn phí trước 24 giờ". Modal thành công hiển thị mã đặt chỗ và tóm tắt booking.
    - **FlightCheckout.tsx**: Phân tách rõ Contact Info (người nhận vé) vs Passenger Info (thông tin hành khách để xuất vé). Tích hợp CheckoutTimer. Summary panel hiển thị timeline khởi hành/đến, thông tin hành lý, chính sách vé và bảng chiết tính giá (giá gốc USD + thuế 10% + phí dịch vụ 5%) quy đổi VND.


- **Booking DTO & Component Refactoring & Flight Details Fix**: Refactored the booking history and details system to properly isolate Hotel and Flight booking domains.
  - **Why it changed**: To clean up architectural violations (such as flight properties residing in a hotel-scoped DTO) and fix the broken Flight Booking details view where flight details and passenger lists were not loaded or displayed.
  - **Affected files**: `BookingsController.cs`, `BookingHistoryDto.cs`, `GetBookingHistoryQuery.cs`, `GetBookingHistoryQueryHandler.cs`, `GetBookingDetailQuery.cs`, `GetBookingDetailQueryHandler.cs` in the Backend. `booking.ts`, `index.ts`, `HotelBookingCard.tsx`, `FlightBookingCard.tsx`, `BookingHistory.tsx`, `BookingDetail.tsx` in the Frontend.
  - **What changed**:
    - **Backend Refactoring**: Replaced `HotelBookingHistoryDto` with `BookingHistoryDto` containing nested `HotelDetails` and `FlightDetails`. Renamed queries to `GetBookingHistoryQuery` and `GetBookingDetailQuery`. Refactored `GetBookingDetailQueryHandler` to query passenger records from `BookingFlights`, flight segments, airlines, and airports, and fallback safely if parsing fails.
    - **Frontend Refactoring**: Added `booking.ts` type definitions and exported them dynamically. Extracted sub-components `HotelBookingCard` and `FlightBookingCard` from `BookingHistory.tsx`. Refactored `BookingHistory.tsx` to map cards conditional on service type.
    - **Flight Details Fix**: Refactored `BookingDetail.tsx` to handle flight service types, displaying airlines, schedules, airport city pairs, and full lists of passenger names, passports, and seats in a clean table format. Conditionally hid checkout buttons for flights and updated cancel buttons.
    - **TypeScript Compilation Fix**: Resolved compiler warning/error in `BookingHistory.tsx` where `safeBookings` was declared but unused due to state migrations.
- **Flight Booking History Display**: Cập nhật trang lịch sử đặt phòng (Booking History) và API để hiển thị chi tiết thông tin cả vé máy bay và khách sạn của người dùng.
  - **Why it changed**: Tính năng xem lịch sử booking hiện tại chỉ hỗ trợ khách sạn, việc mở rộng giúp khách hàng quản lý và tra cứu toàn bộ các loại dịch vụ đã đặt (chuyến bay, khách sạn) trên cùng một giao diện nhất quán.
  - **Affected files**: `GetHotelBookingHistoryQueryHandler.cs`, `HotelBookingHistoryDto.cs`, `hotel.ts`, `BookingHistory.tsx`.
  - **What changed**:
    - **Backend API**: Bổ sung cờ `ServiceType` vào `HotelBookingHistoryDto` cùng các thuộc tính riêng cho vé máy bay (Tên hãng bay, Số hiệu, Mã sân bay đi/đến, Giờ cất/hạ cánh). Nâng cấp query handler `GetHotelBookingHistoryQueryHandler` để thực hiện 2 truy vấn song song cho Khách sạn (kết nối `BookingHotels`) và Chuyến bay (kết nối `BookingFlights`, `Flights`, `Airlines`, `Airports`), sau đó gộp và sắp xếp chung một danh sách trả về.
    - **Frontend DTO**: Bổ sung các trường thuộc tính vé máy bay vào interface `HotelBookingHistoryDto` tại `hotel.ts`.
    - **Frontend UI**: Thiết kế lại UI card của `BookingHistory.tsx` để render có điều kiện dựa trên `serviceType`. Bổ sung layout riêng biệt cực kỳ tinh tế cho thẻ vé máy bay, hiển thị logo hãng hàng không, sân bay cất/hạ cánh, và hiệu ứng dải bay đồ họa đẹp mắt (Sử dụng biểu tượng `Plane` từ `lucide-react`).

- **Duffel Flight Order Parsing & Hybrid Storage Pattern**: Implemented parsing of Duffel Order responses to dynamically extract flight metadata, slices, segments, airlines, airports, and seat assignments, storing them in local database tables.
  - **Why it changed**: To enable rich flight metadata caching locally, allowing billing confirmation emails and booking lookup dashboards to render flight itineraries, carrier info, terminal/airport details, and passenger seats accurately.
  - **Affected files**: [CreateFlightBookingCommandHandler.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Features/Bookings/Commands/CreateFlightBooking/CreateFlightBookingCommandHandler.cs), [project_context.md](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/project_context.md).
  - **What changed**:
    - Parsed Duffel Order JSON response slices/segments in the MediatR command handler.
    - Upserted carrier details into `Airlines` table and origin/destination coordinates/cities/names into `Airports` table.
    - Cached historical flight routes in `Flights` table, matching by code and dates.
    - Resolved seat assignments from both segment passenger data and external seat services, mapping resolved fields to `BookingFlights`.
    - Implemented exception fallback to basic passenger storage (Option A) to guarantee order resilience.

- **Admin Payout Batches**: Implemented the Admin-facing batch payment processing feature to group multiple partner payouts into a single batch and verify them at once.
  - **Why it changed**: To enable admins to execute bulk payouts rather than confirming transactions one by one, reducing overhead and conforming to professional financial accounting patterns.
  - **Affected files**: `IPartnerPayoutRepository.cs`, `PartnerPayoutRepository.cs`, `IUnitOfWork.cs`, `UnitOfWork.cs`, `CreateBatchCommand.cs`, `ConfirmBatchCommand.cs`, `CancelBatchCommand.cs`, `GetUnbatchedPayoutsQuery.cs`, `GetAdminBatchesQuery.cs`, `GetAdminBatchDetailQuery.cs`, `PayoutsController.cs`, `payout.ts`, `payoutService.ts`, `AdminFinance.tsx`, `CreateBatchModal.tsx`, `ConfirmBatchModal.tsx`, `AdminBatchesPanel.tsx`.
  - **What changed**:
    - **Backend Repository & UoW**: Extended `IPartnerPayoutRepository` with methods to fetch unbatched pending payouts, retrieve paged admin batches, and query detailed batch metadata. Exposed the `PayoutBatches` repository in `IUnitOfWork`.
    - **CQRS commands**: Added commands to create a batch (groups pending payouts under a generated batch code), confirm a batch (sets status of batch and child payouts to `Paid` and updates bookings to `Settled`), and cancel a batch (reverts child payouts to `Pending` and clears their `BatchId` as requested by the user).
    - **CQRS queries**: Added queries to fetch unbatched payouts by partner, list paged batches, and get batch details.
    - **API Controllers**: Exposed 6 new secure endpoints for admin batch lifecycle management in `PayoutsController`.
    - **Frontend Types & Services**: Added TypeScript interfaces for `AdminBatchDto` and query payloads. Integrated batch endpoints into `payoutService`.
    - **Frontend User Interface**: Integrated a dual-tab navigation in `AdminFinance.tsx` ("Giao dịch đơn lẻ" & "Đợt Chi Trả" as requested by the user). Developed `AdminBatchesPanel` to list batches with row expansion to display nested child payouts, `CreateBatchModal` with partner selection and checkbox multi-select for pending items, and `ConfirmBatchModal` to securely log transaction bank references.

- **Partner Finance Redesign & Payout Batches**: Fully redesigned the Partner Finance dashboard to use live API data and introduced a new `PayoutBatches` entity to group multiple bookings into a single payout batch.
  - **Why it changed**: To reflect the true financial flow where partners receive aggregated payouts instead of withdrawing individual booking amounts, and to provide accurate, real-time financial stats with dynamic commission rates.
  - **Affected files**: `004_Create_PayoutBatches.sql`, `PayoutBatches.cs`, `PartnerPayouts.cs`, `WanderVNDbContext.cs`, `PartnerPayoutRepository.cs`, `PayoutsController.cs`, `payout.ts`, `payoutService.ts`, `PartnerSidebar.tsx`, `PartnerFinance.tsx`.
  - **What changed**: 
    - Created database migration for `PayoutBatches` and linked it with `PartnerPayouts`.
    - Added partner-scoped endpoints (`[Authorize(Roles = "Partner")]`) in `PayoutsController` to fetch summary stats, paginated transactions, and payout batches without leaking admin endpoints.
    - Commission fee is dynamically fetched from `SystemSettings` ("CommissionFee" key) rather than being hardcoded.
    - Completely rebuilt `PartnerFinance.tsx` with a premium limestone-themed UI featuring statistical summary cards, a transaction table with filters, and an accordion-style batch history section.

### Secured
- **Settings and Payouts API Endpoints**: Secured sensitive API endpoints by applying role-based authorization to restrict financial payout actions and system configuration settings to administrator accounts.
  - **Why it changed**: To close security loopholes where financial payout management (list, stats, confirm, reject) and global configurations (read, write) were accessible to anonymous/unauthorized requests.
  - **Affected files**: `SettingsController.cs`, `PayoutsController.cs`.
  - **What changed**: Added class-level `[Authorize(Roles = "Admin")]` to `PayoutsController` and `SettingsController` to enforce strict access control, and cleaned up redundant method-level attributes.

### Refactored
- **My Booking History API and UI**: Refactored the "My Booking History" endpoint and UI to retrieve the logged-in user's ID directly from secure JWT claims instead of accepting a path parameter.
  - **Why it changed**: To eliminate potential insecure direct object reference (IDOR) vulnerabilities where any user could fetch another user's booking history by altering the ID parameter in the URL.
  - **Affected files**: `BookingsController.cs`, `GetHotelBookingHistoryQuery.cs`, `GetHotelBookingHistoryQueryHandler.cs`, `hotelService.ts`, `BookingHistory.tsx`.
  - **What changed**:
    - **Backend API**: Enforced `[Authorize]` on the endpoint and changed route to `[HttpGet("history")]`. Moved the responsibility of extracting `userId` from secure JWT claims down into the Application layer, handling `UnauthorizedAccessException` at the controller level to yield a proper `401 Unauthorized` response.
    - **Application Layer**: Injected `ICurrentUserService` into `GetHotelBookingHistoryQueryHandler` to resolve the current user's ID directly from token claims in the handler, completely decoupling the controller and API layer from this business logic.
    - **Frontend Service**: Updated `getMyHotelBookings` in `hotelService.ts` to call `/bookings/history` without accepting/passing a `userId` argument.
    - **Frontend UI**: Simplified the API invocation in `BookingHistory.tsx` to call `getMyHotelBookings()` with no arguments.

- **Clean Architecture Identity Resolution**: Refactored partner finance query handlers (`GetPartnerPayoutSummaryQueryHandler`, `GetPartnerTransactionsQueryHandler`, `GetPartnerBatchesQueryHandler`) and `PayoutsController` to use `ICurrentUserService` for identifying the current partner.
  - **Why it changed**: To adhere strictly to Clean Architecture principles, remove manual claim parsing from controllers, prevent API spoofing of `PartnerId`, and resolve `UnauthorizedAccessException` at runtime caused by faulty claim extraction.
  - **Affected files**: `PayoutsController.cs`, `GetPartnerPayoutSummaryQuery.cs`, `GetPartnerTransactionsQuery.cs`, `GetPartnerBatchesQuery.cs`.
  - **What changed**: Injected `ICurrentUserService` into query handlers to securely resolve the current user's ID within the Application layer instead of passing it from the API layer. Removed `GetPartnerIdFromToken` helper and direct claim inspections from `PayoutsController`.
- **Booking String Properties to Enum (INT)**: Refactored the core loose string properties on `Bookings` (`ServiceType`, `Status`, `PaymentStatus`) to type-safe C# enums mapped to `INT` in SQL Server for superior data integrity.
  - **Why it changed**: To eliminate raw string comparisons across the entire codebase, prevent spelling errors, and unify the database schema design where other properties (e.g. `PayoutStatus`, `UserStatus`) are already numeric enums.
  - **Affected files**: `Bookings.cs`, `BookingServiceType.cs`, `BookingStatus.cs`, `BookingPaymentStatus.cs`, `WanderVNDbContext.cs`, `BookingSettlementBackgroundService.cs`, `CreateFlightBookingCommandHandler.cs`, `CreateHotelBookingCommandHandler.cs`, `CreateZaloPayUrlCommandHandler.cs`, `ProcessZaloPayCallbackCommandHandler.cs`, `CreateVNPayUrlCommandHandler.cs`, `ProcessVNPayIpnCommandHandler.cs`, `CancelBookingCommandHandler.cs`, `CheckOutBookingCommandHandler.cs`, `GetHotelBookingDetailQueryHandler.cs`, `GetHotelBookingHistoryQueryHandler.cs`, `GetPayoutsQueryHandler.cs`, `PaymentEmailTemplateBuilder.cs`, `ConfirmPayoutCommandHandler.cs`, `RejectPayoutCommandHandler.cs`, `HotelRepository.cs`, `migration_convert_bookings_to_enum_int.sql`.
  - **What changed**:
    - **Database Migration**: Created SQL migration script `migration_convert_bookings_to_enum_int.sql` that dynamically drops old default constraints and safely converts existing string columns to integer enums.
    - **C# Types & EF Core**: Created 3 C# Enum files in `WanderVN.Domain.Enums` namespace. Changed `Bookings` entity properties to these enums and mapped them via `.HasConversion<int>()` in EF Core.
    - **Stored Procedure Integration**: Redeployed stored procedure `sp_LookupBooking` to use numerical comparisons in query evaluation while projecting out string names via `CASE` blocks to maintain 100% backward compatibility with the frontend and existing lookup DTOs.
    - **Business Logic Updates**: Updated all application layer commands, query handlers, repositories, email builders, and background services to use strong types instead of loose string values.

### Added
- **Automated Payout & Settlement Flow (CheckIn → CheckOut → Payout)**: Refactored the partner payment architecture to enforce a robust, automatic settlement flow. Payouts are now created after checkout + a configurable grace period, rather than immediately at payment callback.
  - **Why it changed**: To protect the platform against fraud and dispute requests, ensuring partner payouts are only created for actual completed stays.
  - **Affected files**: `PartnerPayouts.cs`, `Bookings.cs`, `WanderVNDbContext.cs`, `PartnerPayoutRepository.cs`, `BookingSettlementBackgroundService.cs`, `DependencyInjection.cs`, `ProcessZaloPayCallbackCommandHandler.cs`, `ProcessVNPayIpnCommandHandler.cs`, `CheckOutBookingCommandHandler.cs`, `ConfirmPayoutCommandHandler.cs`, `RejectPayoutCommand.cs`, `RejectPayoutCommandHandler.cs`, `PayoutDto.cs`, `GetPayoutsQueryHandler.cs`, `PayoutsController.cs`, `002_Add_CheckedOutAt_And_PayoutStatus.sql`, `payout.ts`, `payoutService.ts`, `FinanceTable.tsx`, `FinanceFilters.tsx`, `AdminFinance.tsx`.
  - **What changed**:
    - **Database Migration**: Created SQL migration script adding `CheckedOutAt` to `Bookings`, converting `PartnerPayouts.Status` from string to integer enum, and inserting a default `PayoutGracePeriodHours` setting value.
    - **Background Settlement**: Implemented `BookingSettlementBackgroundService` executing every 5 minutes to scan completed, paid bookings past the grace period, calculate commission fees, and automatically generate pending payouts.
    - **Rejection Endpoint**: Created a CQRS `RejectPayoutCommand` and API endpoint `PUT api/v1/payouts/{id}/reject` allowing administrators to reject payouts with reasons, automatically reverting booking status to `Completed` for review.
    - **UI Redesign**: Fully redesigned the Finance administrative page including action logic for `Pending` (Show Details, Approve, Reject), `Processing` (Pending indicators), and other statuses with rich interactive details.
- **Admin Settings**: Created `SettingResponseDto` to provide structured settings data and added a dedicated `/admin/settings` route with `AdminSettings` UI component.
  - **Why it changed**: To prepare the infrastructure for global system settings management via the admin panel.
  - **Affected files**: `SettingResponseDto.cs`, `GetSettingQuery.cs`, `SettingsController.cs`, `AdminSettings.tsx`, `App.tsx`.
  - **What changed**: Updated backend query to return DTO instead of primitive string. Created new frontend admin component and integrated it into the router.
- **Guest Reservation & Booking Lookup**: Supported 100% guest reservations (Hotels & Flights) without requiring account registration. Designed and implemented a cinematic, Editorial Minimalism booking lookup page (`/booking-lookup`) permitting guests to track reservations using `BookingCode` and `Email`.
  - **Why it changed**: To provide a seamless booking experience for unauthenticated guest users and let them manage their reservations on-demand.
  - **Affected files**: `WanderVN.API/Controllers/BookingsController.cs`, `BookingLookupDetailDto.cs`, `LookupBookingQuery.cs`, `LookupBookingQueryHandler.cs`, `BookingLookup.tsx`, `App.tsx`, `Navbar.tsx`, `Footer.tsx`.
  - **What changed**: Modified `Bookings` DB schema to save guest contact info directly (`Email`, `CustomerName`, `CustomerPhone`). Modified `CreateHotelBooking` and `CreateFlightBooking` command handlers to support unauthenticated guest reservation requests. Created dynamic `/booking-lookup` SPA route and UI featuring secure cancellation, checkout, and online payment re-initiations (VNPay & ZaloPay) on the fly.
- **Payments**: Created a centralized `PaymentEmailTemplateBuilder` to compose and share confirmation emails across both VNPay and ZaloPay callback handlers.
  - **Why it changed**: To ensure consistent customer communication across different payment methods and to include full detailed flight information.
  - **Affected files**: `PaymentEmailTemplateBuilder.cs`, `ProcessVNPayIpnCommandHandler.cs`, `ProcessZaloPayCallbackCommandHandler.cs`
  - **What changed**: Extracted email rendering from VNPay handler. Upgraded the flight details email layout to include complete Duffel API-like context (Airline name, Flight numbers, Dep/Arr Airports & Times, Passenger Names, Passports, and Seat Numbers). Updated EF Core `includeProperties` in handlers to eager load the `Flight`, `Airline` and `Airports` relationships.

### Fixed
- **Sửa lỗi hiển thị sai thông tin Khách Sạn / Chuyến Bay trong lịch sử đặt chỗ (Mockup bug)**: Refactor lại logic parse dữ liệu trả về từ API trên trang `BookingHistory` và `BookingDetail` để tự động nội suy `serviceType` dựa trên dữ liệu thật.
  - **Why it changed**: API backend trả về cấu trúc phẳng (flat JSON) thiếu trường `serviceType` cho các khách sạn cũ, khiến logic kiểm tra `booking.serviceType === 'Flight'` hoạt động sai và giao diện rơi vào trạng thái fallback hiển thị mockup chữ "Hệ thống Khách sạn Cao Cấp".
  - **Affected files**: `BookingDetail.tsx`, `BookingHistory.tsx`, `hotelService.ts`, `bookingUtils.ts` (mới).
  - **What changed**:
    - Tạo tiện ích `normalizeBookingData` trong `src/utils/bookingUtils.ts` để chuẩn hóa dữ liệu API dạng phẳng thành cấu trúc lồng nhau (`hotelDetails` / `flightDetails`) đúng chuẩn `BookingHistoryDto`.
    - Cập nhật `hotelService.ts` tự động `normalizeBookingData` trước khi trả kết quả về cho component.
    - Chuyển logic gọi `fetch` thủ công trong `BookingDetail.tsx` sang sử dụng hàm `request` chung từ `apiClient` kèm chuẩn hóa dữ liệu, loại bỏ code thừa và thông báo lỗi không chuyên nghiệp.
    - Cải thiện logic đếm số lượng booking theo tab trực tiếp trong `BookingHistory.tsx` dùng `useMemo` thay vì filter nhiều lần trong JSX.
- **Lỗi Duffel API 422 Unprocessable Entity khi đặt vé máy bay**: Sửa lỗi gọi Duffel API trả về mã lỗi 422 do hành khách thiếu email hoặc số điện thoại (đặc biệt là hành khách chính `passengers/0`).
  - **Why it changed**: Duffel yêu cầu email và số điện thoại của hành khách liên hệ chính không được để trống khi đặt vé máy bay (`instant` order creation).
  - **Affected files**: [CreateFlightBookingCommandHandler.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Application/Features/Bookings/Commands/CreateFlightBooking/CreateFlightBookingCommandHandler.cs)
  - **What changed**:
    - Nâng cấp handler lấy thông tin User đang đăng nhập sớm hơn.
    - Tự động điền email/sđt của User làm thông tin liên hệ chính nếu đầu vào từ Frontend bị thiếu.
    - Điền sđt mặc định `+84999999999` làm dự phòng nếu khách vãng lai (guest) không cung cấp sđt nhằm tránh lỗi API Sandbox của Duffel.
    - Tối ưu hóa không cần gọi lại DB truy vấn User ở cuối handler khi gửi mail xác nhận.

- **Lộ thông tin lỗi kỹ thuật và không hỗ trợ UTF-8 cho phản hồi tiếng Việt**: Sửa lỗi ExceptionMiddleware trả về chi tiết lỗi hệ thống / lỗi kết nối SQL Server cho client và không hỗ trợ bảng mã UTF-8 tiếng Việt khi serialize JSON.
  - **Why it changed**: Tránh rò rỉ các lỗi kỹ thuật chi tiết như cấu hình CSDL, chuỗi kết nối và đảm bảo các phản hồi lỗi tiếng Việt hiển thị chính xác không bị mã hóa ký tự.
  - **Affected files**: [ExceptionMiddleware.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.API/Middleware/ExceptionMiddleware.cs)
  - **What changed**:
    - Thay thế thông tin chi tiết lỗi của HttpStatusCode.InternalServerError thành thông điệp chung thân thiện: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.".
    - Bổ sung cấu hình `charset=utf-8` vào Content-Type phản hồi.
    - Cấu hình `JsonSerializerOptions` sử dụng `JavaScriptEncoder.Create(UnicodeRanges.All)` để không mã hóa các ký tự tiếng Việt.

- **System.InvalidOperationException on Booking Lookup**: Fixed a critical runtime error where `LookupBookingAsync` threw an exception due to client-side query composition over a non-composable Stored Procedure (`EXEC sp_LookupBooking ...`).
  - **Why it changed**: Calling `FirstOrDefaultAsync()` directly on `Database.SqlQuery<T>` over an `EXEC` statement forces EF Core to try to generate subqueries in SQL Server (which is not allowed for `EXEC`), leading to composition failures.
  - **Affected files**: [BookingRepository.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Infrastructure/Repositories/BookingRepository.cs), [WanderVNDbContext.cs](file:///home/ducdat/IT/CNPM/LT-Web-ASP.Net-Core/WanderVN/Backend/WanderVN.Infrastructure/Data/WanderVNDbContext.cs)
  - **What changed**:
    - Refactored `BookingRepository.cs` to execute the query as an `AsAsyncEnumerable()` and retrieve the first element using an `await foreach` loop, preventing invalid SQL compilation and composition.
    - Registered `BookingLookupDetailDto` as a keyless entity in `WanderVNDbContext.cs` and explicitly defined the `decimal(18, 2)` store type for the `TotalPrice` property to eliminate the related EF Core model validation warning.

- **Lỗi giao diện (Mobile Navbar & Form đè chữ)**: Sửa lỗi text góc trái màn hình (ví dụ Sapa Việt Nam) đè lên biểu mẫu tìm kiếm khách sạn và cải thiện trải nghiệm hiển thị mobile menu khi ở đầu trang.
  - **Why it changed**: Trực quan hóa giao diện kém tinh tế khi text di sản có `z-index` quá cao so với biểu mẫu và menu di động bị trong suốt ở đầu trang gây khó đọc liên kết.
  - **Affected files**: `JourneyRevealHero.tsx`, `Navbar.tsx`.
  - **What changed**:
    - Điều chỉnh `z-index` của biểu mẫu tìm kiếm lên `z-[45]` và ẩn toàn bộ metadata góc màn hình trên mobile/tablet (`hidden md:block` và `z-[30]`) để loại bỏ hoàn toàn sự đè lấn.
    - Cập nhật điều kiện `isTransparent` và class của `Navbar` để tắt trong suốt (chuyển sang màu nền mờ nhòe kính mờ `bg-background/90 backdrop-blur-lg`) ngay khi click mở menu ngăn kéo (mobile drawer).
- **Trùng lặp tham số tìm kiếm không thể click lại**: Sửa lỗi không thể nhấp tìm kiếm lại chuyến bay và khách sạn khi bộ lọc/tham số tìm kiếm không đổi.
  - **Why it changed**: Trình duyệt không thay đổi URL khi nhấp tìm kiếm với cùng một bộ lọc làm cho các hooks trong React không nhận biết được sự thay đổi để kích hoạt lại API tìm kiếm.
  - **Affected files**: `SearchFlights.tsx`, `HotelSearchForm.tsx`, `SearchStays.tsx`.
  - **What changed**: Bổ sung tham số ngẫu nhiên thời gian `_t` (timestamp) vào các tham số tìm kiếm URL khi nhấn gửi biểu mẫu để làm mới URL, đồng thời thay đổi dependency của `useEffect` trong `SearchStays.tsx` thành `[searchParams]` để bảo đảm dữ liệu luôn được tải lại mỗi lần nhấn nút tìm kiếm.
- **Giữ nguyên vị trí cuộn khi chuyển trang**: Khắc phục lỗi vị trí cuộn trang (scroll position) không được reset khi điều hướng qua các route khác nhau.
  - **Why it changed**: React Router sử dụng cơ chế client-side routing, cập nhật DOM nội bộ mà không tải lại trang đầy đủ, dẫn đến việc vị trí cuộn của cửa sổ trình duyệt được giữ nguyên từ trang trước đó, gây trải nghiệm người dùng kém tự nhiên.
  - **Affected files**: `ScrollToTop.tsx`, `App.tsx`.
  - **What changed**: Tạo mới component `ScrollToTop` lắng nghe sự thay đổi của `pathname` để tự động thực hiện `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })`, đồng thời đăng ký component này ngay dưới thẻ `<Router>` trong `App.tsx`.
- **EF Core Model Validation Warning**: Fixed EF Core model validation warnings for decimal properties (`CommissionAmount`, `GrossAmount`, and `NetAmount`) on `PartnerPayouts` by explicitly configuring the `decimal(18, 2)` column type in `WanderVNDbContext.cs`.
- **Jwt Security Warning**: Upgraded package `System.IdentityModel.Tokens.Jwt` to `8.0.1` in `WanderVN.Application` to resolve a moderate-severity vulnerability (NU1902).
- **Authentication**: Resolved a critical issue where the `purpose` custom claim in the email verification JWT was being dropped by `JwtSecurityTokenHandler` in the ASP.NET Core environment.
  - **Why it changed**: The framework's default JWT validation pipeline failed to expose unmapped custom claims like `purpose` via `.Payload` or `.Claims` during token verification, causing valid verification requests to be rejected with "Token không đúng mục đích sử dụng".
  - **Affected files**: `WanderVN.Application/Features/Auth/Commands/VerifyEmailCommandHandler.cs`
  - **What changed**: Bypassed the standard claim mapping mechanism for the `purpose` claim by directly splitting the raw `request.Token` and decoding the Base64Url JSON payload using `System.Text.Json.JsonDocument.Parse`. This guarantees 100% extraction reliability of the `purpose` claim since `ValidateToken` already verified the token's cryptographic signature.
- **CI/CD Pipeline (Somee Deploy)**: Resolved critical "file in use by another process" deployment errors during FTP uploads to Somee.
  - **Why it changed**: ASP.NET Core worker processes on IIS (Somee) lock DLLs during runtime, blocking direct FTP overwrites.
  - **Affected files**: `.github/workflows/deploy.yml`
  - **What changed**: Integrated `app_offline.htm` automation. The pipeline now uploads `app_offline.htm` to gracefully shut down the application, release file locks, perform the FTP deployment, and then deletes it (`if: always()`) to safely bring the website back online.

### Changed
- `LookupBookingQueryHandler`: Refactored to use `IBookingRepository` and replaced complex EF Core query with a Stored Procedure (`sp_LookupBooking`) for better performance and maintainability.



### Huỷ đơn quá hạn thanh toán
 - Added UnpaidBookingExpirationBackgroundService to cancel hotel bookings that stay Pending + Unpaid past the configured
    hold window and release linked rooms back to "Available".

  - Registered it in Backend/WanderVN.Infrastructure/DependencyInjection.cs.
  - Added shared expiration helper for payment flows in Backend/WanderVN.Application/Common/Utils/
    BookingPaymentExpirationHelper.cs.

  - Guarded VNPay/ZaloPay URL creation and callbacks so expired/cancelled/non-pending bookings cannot be paid or resurrected.
  - VNPay failed payments now release hotel rooms immediately.
  - Added setting seed migration: Database/Migrations/005_Add_UnpaidBookingExpiration_Setting.sql, default
    UnpaidBookingExpirationMinutes = 30.
  
### Cache
What changed:

  - Added IFlightSearchCacheService and FlightSearchCacheSettings.
  - Added FlightSearchCacheService using IDistributedCache with Redis.
  - Added NoOpFlightSearchCacheService fallback when no Redis connection string is
    configured.

  - Updated SearchFlightsQueryHandler to:
      - check cache before calling Duffel,
      - cache parsed FlightOfferDto results after Duffel response,
      - keep GetOfferAsync and order creation uncached.

  - Added Redis package to Infrastructure.
  - Added ConnectionStrings:Redis and FlightSearchCache config.

  Key files:

  - Backend/WanderVN.Application/Features/Flights/Queries/SearchFlights/
    SearchFlightsQueryHandler.cs

  - Backend/WanderVN.Infrastructure/Services/FlightSearchCacheService.cs
  - Backend/WanderVN.Infrastructure/DependencyInjection.cs
  - Backend/WanderVN.API/appsettings.json

  Verification:

  - dotnet build Backend/WanderVN.sln passed: 5 projects, 0 errors, 0 warnings.
  - JSON config validation passed for appsettings.json, appsettings.Development.json,
    and appsettings.Production.json.What changed:

  - Added IFlightSearchCacheService and FlightSearchCacheSettings.
  - Added FlightSearchCacheService using IDistributedCache with Redis.
  - Added NoOpFlightSearchCacheService fallback when no Redis connection string is
    configured.

  - Updated SearchFlightsQueryHandler to:
      - check cache before calling Duffel,
      - cache parsed FlightOfferDto results after Duffel response,
      - keep GetOfferAsync and order creation uncached.

  - Added Redis package to Infrastructure.
  - Added ConnectionStrings:Redis and FlightSearchCache config.

  Key files:

  - Backend/WanderVN.Application/Features/Flights/Queries/SearchFlights/
    SearchFlightsQueryHandler.cs

  - Backend/WanderVN.Infrastructure/Services/FlightSearchCacheService.cs
  - Backend/WanderVN.Infrastructure/DependencyInjection.cs
  - Backend/WanderVN.API/appsettings.json

  Verification:

  - dotnet build Backend/WanderVN.sln passed: 5 projects, 0 errors, 0 warnings.
  - JSON config validation passed for appsettings.json, appsettings.Development.json,
    and appsettings.Production.json.
## [2026-06-09] - Airport Autocomplete Integration

### Added
- Seeded ~27 domestic and popular international airports into the `Airports` table via `script_seed_airports.sql`.
- Added `IAirportRepository` and its Dapper implementation `AirportRepository` to fetch airports dynamically.
- Created `GetAirportsQuery` and `GetAirportsQueryHandler` in the Application layer.
- Added `GET /api/v1/search/airports` endpoint in `SearchController` to provide airport search and autocomplete.
- Added `AirportDto` to the frontend types.
- Implemented `getAirports` in `searchService.ts` on the frontend.
- Fully refactored `FlightSearchForm.tsx` to replace static airport arrays with dynamic autocomplete search fields.

### Verification
- `.NET Build` passed successfully.
- Seed script executed correctly.
