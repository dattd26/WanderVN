# WanderVN

WanderVN là một nền tảng du lịch trực tuyến (OTA - Online Travel Agency) cho phép người dùng tìm kiếm, đặt chỗ và thanh toán trực tuyến các dịch vụ du lịch như khách sạn và chuyến bay.

Dự án được xây dựng với mục tiêu mang đến trải nghiệm tìm kiếm và đặt dịch vụ du lịch hiện đại, đồng thời đóng vai trò như một hệ thống thực hành các kỹ thuật phát triển phần mềm thực tế như Clean Architecture, CQRS, thanh toán trực tuyến, quản lý đối tác và xử lý giao dịch.

---

## Chức năng chính

### Khách hàng (Customer)

* Tìm kiếm khách sạn theo địa điểm, ngày nhận phòng và số lượng khách.
* Xem thông tin chi tiết khách sạn, loại phòng và giá bán.
* Tìm kiếm chuyến bay theo hành trình và ngày khởi hành.
* Đặt phòng khách sạn và vé máy bay trực tuyến.
* Thanh toán qua VNPay và ZaloPay.
* Theo dõi lịch sử đặt chỗ.
* Tra cứu đơn hàng bằng mã đặt chỗ và email.
* Hủy đặt chỗ hoặc thanh toán lại đối với các đơn hàng chưa hoàn tất.

### Đối tác (Partner)

* Đăng ký trở thành đối tác lưu trú.
* Quản lý thông tin khách sạn.
* Quản lý loại phòng và giá bán.
* Theo dõi doanh thu từ các đơn đặt chỗ.
* Theo dõi các khoản đối soát và hoa hồng.

### Quản trị viên (Admin)

* Quản lý người dùng.
* Quản lý đối tác.
* Quản lý khách sạn và nội dung hệ thống.
* Theo dõi doanh thu và thống kê hoạt động.
* Quản lý các yêu cầu đăng ký đối tác.

---

## Kiến trúc hệ thống

Dự án được xây dựng theo mô hình Clean Architecture kết hợp CQRS.

```text
Backend
├── WanderVN.API
├── WanderVN.Application
├── WanderVN.Domain
└── WanderVN.Infrastructure
```

### WanderVN.Domain

Chứa các Entity, Value Objects, Enums và Repository Interfaces.

### WanderVN.Application

Chứa:

* CQRS Commands & Queries
* MediatR Handlers
* DTOs
* Validators
* Business Rules

### WanderVN.Infrastructure

Chứa:

* Entity Framework Core
* Dapper
* SQL Server
* Payment Integrations
* External Services

### WanderVN.API

Chứa:

* RESTful APIs
* Authentication & Authorization
* Middleware
* Swagger/OpenAPI

---

## Công nghệ sử dụng

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Lucide React

### Backend

* ASP.NET Core 8 Web API
* Entity Framework Core
* Dapper
* MediatR
* FluentValidation
* JWT Authentication

### Database

* Microsoft SQL Server

### Thanh toán

* VNPay
* ZaloPay

### Dịch vụ bên thứ ba

* Duffel API (Flight Search)

---

## Chiến lược truy cập dữ liệu

Dự án sử dụng mô hình Hybrid Data Access:

* Entity Framework Core cho các nghiệp vụ ghi dữ liệu (Create, Update, Delete).
* Dapper cho các truy vấn đọc phức tạp hoặc yêu cầu hiệu năng cao.

Mục tiêu là cân bằng giữa tốc độ phát triển, khả năng bảo trì và hiệu năng hệ thống.

---


## Chạy dự án

### Backend

```bash
cd Backend

dotnet restore

dotnet run --project WanderVN.API
```

Mặc định:

```text
http://localhost:5096
```

### Frontend

```bash
cd Frontend

npm install

npm run dev
```

Mặc định:

```text
http://localhost:5173
```

---

## Triển khai

Dự án sử dụng GitHub Actions để tự động triển khai khi có thay đổi trên nhánh `main`.

Backend hiện được triển khai trên Somee.com.

Các GitHub Secrets cần cấu hình:

```text
SOMEE_FTP_SERVER
SOMEE_FTP_USERNAME
SOMEE_FTP_PASSWORD
APPSETTINGS_PRODUCTION_JSON
```

---

## Mục tiêu học tập

Dự án được thực hiện nhằm nghiên cứu và áp dụng:

* Clean Architecture
* CQRS & MediatR
* Repository & Unit of Work
* Entity Framework Core
* Dapper
* Thanh toán trực tuyến
* Tích hợp API bên thứ ba
* CI/CD với GitHub Actions
* Xây dựng hệ thống OTA thực tế

```
```
