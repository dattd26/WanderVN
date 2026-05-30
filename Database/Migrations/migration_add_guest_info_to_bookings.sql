-- SQL Migration: Thêm các cột thông tin liên hệ của khách vãng lai (Guest) vào bảng Bookings
-- Cho phép đặt phòng/vé mà không cần tài khoản User, chỉ yêu cầu email liên hệ

ALTER TABLE [dbo].[Bookings] ADD [Email] NVARCHAR(255) NULL;
GO

ALTER TABLE [dbo].[Bookings] ADD [CustomerName] NVARCHAR(255) NULL;
GO

ALTER TABLE [dbo].[Bookings] ADD [CustomerPhone] VARCHAR(50) NULL;
GO
