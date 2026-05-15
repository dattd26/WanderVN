# WanderVN

WanderVN là một ứng dụng web B2C, cung cấp các giải pháp tìm kiếm, đặt chỗ và thanh toán trực tuyến cho Khách sạn, Chuyến bay và Tour du lịch.

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