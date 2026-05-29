# WanderVN

WanderVN là một ứng dụng web B2C, cung cấp các giải pháp tìm kiếm, đặt chỗ và thanh toán trực tuyến cho Khách sạn, Chuyến bay và Tour du lịch.

### Tài khoản mẫu

| Role | Email | Password |
|---|---|---|
| Admin | admin@wandervn.com | az0777541112@ |
| Partner | partner-test@gmail.com | az0777541112@ |
| Customer | dattd0511@gmail.com | 123456 |

## Kiến trúc (Architecture)

Kho lưu trữ (repository) này được chia thành hai phần chính:

### 1. Frontend (React + Vite + Tailwind CSS)

* **Framework:** ReactJS 19 (TypeScript) xây dựng với Vite.
* **Styling:** Tailwind CSS v3.
* **Vị trí:** `Frontend/`

### 2. Backend (ASP.NET Core Web API)

* **Framework:** .NET Core Web API (C#).
* **Kiến trúc:** Clean Architecture + CQRS.
* `WanderVN.Domain`: Các thực thể cốt lõi (entities) và giao diện (interfaces).
* `WanderVN.Application`: Logic nghiệp vụ.
* `WanderVN.Infrastructure`: Truy cập dữ liệu (EF Core + Dapper).
* `WanderVN.API`: Web API, Swagger và cấu hình Dependency Injection (DI).

## Hướng dẫn cấu hình local bảo mật (Local Secret Configuration)

Để bảo mật thông tin nhạy cảm (như API Access Token của Duffel) và tránh bị lộ trên GitHub, dự án đã cấu hình sử dụng **.NET User Secrets** ở môi trường phát triển local.

Khi clone dự án về, mỗi thành viên trong nhóm cần thực hiện lệnh sau trong terminal tại thư mục chứa file dự án của mình để cấu hình token local của riêng họ:

### Cấu hình Duffel Access Token local:
1. Mở terminal tại thư mục: `Backend/WanderVN.API`
2. Chạy lệnh:
   ```bash
   dotnet user-secrets set "Duffel:AccessToken" "YOUR_DUFFEL_ACCESS_TOKEN_HERE"
   ```

*Lưu ý: Mọi thay đổi trong `appsettings.json` đều đã được thay thế bằng placeholder `"YOUR_DUFFEL_ACCESS_TOKEN_HERE"`. Không thay đổi trực tiếp file `appsettings.json`.