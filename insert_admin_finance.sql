USE [WanderVN];
GO

/* =====================================================================
   INSERT DỮ LIỆU MẪU CHO TRANG AdminFinance
   Chạy lần lượt từng block (1 -> 2 -> 3) trong SSMS
   ===================================================================== */


/* ---------------------------------------------------------------------
   BLOCK 1: THÊM PARTNER MỚI
   (Bỏ qua nếu bạn đã có nhiều partner — chỉ thêm để dữ liệu phong phú)
   --------------------------------------------------------------------- */

INSERT INTO [dbo].[Users] (RoleId, Email, PasswordHash, FullName, PhoneNumber, AvatarUrl, IsActive, CreatedAt)
VALUES (1, N'partner.hotelhanoi@wandervn.com',
        N'$2a$11$DowJZxbWcLnPSCx8nVjyAOk0X7nb5l3jJPx0EZQ.r3PRZTHBxNNgK',
        N'Nguyễn Văn An (Hotel Hà Nội)', N'0901111001',
        N'https://i.pravatar.cc/150?img=11', 1, SYSDATETIMEOFFSET());

INSERT INTO [dbo].[Users] (RoleId, Email, PasswordHash, FullName, PhoneNumber, AvatarUrl, IsActive, CreatedAt)
VALUES (1, N'partner.resortdanang@wandervn.com',
        N'$2a$11$DowJZxbWcLnPSCx8nVjyAOk0X7nb5l3jJPx0EZQ.r3PRZTHBxNNgK',
        N'Trần Thị Bình (Resort Đà Nẵng)', N'0901111002',
        N'https://i.pravatar.cc/150?img=12', 1, SYSDATETIMEOFFSET());

INSERT INTO [dbo].[Users] (RoleId, Email, PasswordHash, FullName, PhoneNumber, AvatarUrl, IsActive, CreatedAt)
VALUES (1, N'partner.villaphuquoc@wandervn.com',
        N'$2a$11$DowJZxbWcLnPSCx8nVjyAOk0X7nb5l3jJPx0EZQ.r3PRZTHBxNNgK',
        N'Lê Hoàng Cường (Villa Phú Quốc)', N'0901111003',
        N'https://i.pravatar.cc/150?img=13', 1, SYSDATETIMEOFFSET());

INSERT INTO [dbo].[Users] (RoleId, Email, PasswordHash, FullName, PhoneNumber, AvatarUrl, IsActive, CreatedAt)
VALUES (1, N'partner.flightagency@wandervn.com',
        N'$2a$11$DowJZxbWcLnPSCx8nVjyAOk0X7nb5l3jJPx0EZQ.r3PRZTHBxNNgK',
        N'Phạm Mỹ Dung (Đại lý vé máy bay)', N'0901111004',
        N'https://i.pravatar.cc/150?img=14', 1, SYSDATETIMEOFFSET());
GO


/* ---------------------------------------------------------------------
   BLOCK 2: TẠO BOOKINGS MẪU
   Đa dạng trạng thái: Unpaid / Paid / Confirmed / CheckedIn /
                       Completed / SettlementPending / Settled
   UserId = lấy bằng email partner (tự tra cứu, không cần biết Id)
   --------------------------------------------------------------------- */

-- 1) Settled (đã đối soát xong)
INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.hotelhanoi@wandervn.com'),
        N'VN-FIN-0001', N'Hotel', 3500000, N'Settled', N'Paid', DATEADD(DAY, -45, SYSDATETIMEOFFSET()));

INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.resortdanang@wandervn.com'),
        N'VN-FIN-0002', N'Hotel', 5200000, N'Settled', N'Paid', DATEADD(DAY, -40, SYSDATETIMEOFFSET()));

INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.flightagency@wandervn.com'),
        N'VN-FIN-0003', N'Flight', 2800000, N'Settled', N'Paid', DATEADD(DAY, -38, SYSDATETIMEOFFSET()));

-- 2) SettlementPending (đã duyệt, đang chờ chi trả)
INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.hotelhanoi@wandervn.com'),
        N'VN-FIN-0004', N'Hotel', 4100000, N'SettlementPending', N'Paid', DATEADD(DAY, -22, SYSDATETIMEOFFSET()));

INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.villaphuquoc@wandervn.com'),
        N'VN-FIN-0005', N'Hotel', 6900000, N'SettlementPending', N'Paid', DATEADD(DAY, -20, SYSDATETIMEOFFSET()));

INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.flightagency@wandervn.com'),
        N'VN-FIN-0006', N'Flight', 3200000, N'SettlementPending', N'Paid', DATEADD(DAY, -18, SYSDATETIMEOFFSET()));

-- 3) Completed (hoàn tất chuyến đi, chờ duyệt payout)
INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.resortdanang@wandervn.com'),
        N'VN-FIN-0007', N'Hotel', 2400000, N'Completed', N'Paid', DATEADD(DAY, -10, SYSDATETIMEOFFSET()));

INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'string@gmail.com'),
        N'VN-FIN-0008', N'Hotel', 7800000, N'Completed', N'Paid', DATEADD(DAY, -8, SYSDATETIMEOFFSET()));

-- 4) CheckedIn (đang lưu trú, chưa cần payout)
INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.villaphuquoc@wandervn.com'),
        N'VN-FIN-0009', N'Flight', 1900000, N'CheckedIn', N'Paid', DATEADD(DAY, -5, SYSDATETIMEOFFSET()));

-- 5) Confirmed (đã xác nhận, chuẩn bị check-in)
INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'string@gmail.com'),
        N'VN-FIN-0010', N'Hotel', 3700000, N'Confirmed', N'Paid', DATEADD(DAY, -3, SYSDATETIMEOFFSET()));

-- 6) Paid (vừa thanh toán)
INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.hotelhanoi@wandervn.com'),
        N'VN-FIN-0011', N'Flight', 2200000, N'Paid', N'Paid', DATEADD(DAY, -2, SYSDATETIMEOFFSET()));

-- 7) Unpaid (chưa thanh toán)
INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.resortdanang@wandervn.com'),
        N'VN-FIN-0012', N'Hotel', 4500000, N'Unpaid', N'Unpaid', DATEADD(DAY, -1, SYSDATETIMEOFFSET()));

-- 8) 1 booking đặc biệt cho payout Rejected
INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
VALUES ((SELECT Id FROM Users WHERE Email = N'partner.flightagency@wandervn.com'),
        N'VN-FIN-REJ1', N'Hotel', 1500000, N'Completed', N'Paid', DATEADD(DAY, -12, SYSDATETIMEOFFSET()));
GO


/* ---------------------------------------------------------------------
   BLOCK 3: TẠO PARTNER PAYOUTS
   Hoa hồng nền tảng 15% (GrossAmount * 0.15)
   Status Payout: Pending / Approved / Paid / Rejected
   --------------------------------------------------------------------- */

-- 3 Payouts đã chi trả (Paid) — tương ứng booking Settled
INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-0001'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-0001'),
    3500000, 525000, 2975000,
    N'Paid', N'BankTransfer', DATEADD(DAY, -42, SYSDATETIMEOFFSET()),
    N'TXN-9A7B3C2E', DATEADD(DAY, -45, SYSDATETIMEOFFSET())
);

INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-0002'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-0002'),
    5200000, 780000, 4420000,
    N'Paid', N'BankTransfer', DATEADD(DAY, -37, SYSDATETIMEOFFSET()),
    N'TXN-1F4E5D6C', DATEADD(DAY, -40, SYSDATETIMEOFFSET())
);

INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-0003'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-0003'),
    2800000, 420000, 2380000,
    N'Paid', N'BankTransfer', DATEADD(DAY, -35, SYSDATETIMEOFFSET()),
    N'TXN-8B2A1F0D', DATEADD(DAY, -38, SYSDATETIMEOFFSET())
);

-- 3 Payouts đã duyệt (Approved) — chờ chi trả
INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-0004'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-0004'),
    4100000, 615000, 3485000,
    N'Approved', N'Manual', NULL, NULL, DATEADD(DAY, -22, SYSDATETIMEOFFSET())
);

INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-0005'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-0005'),
    6900000, 1035000, 5865000,
    N'Approved', N'Manual', NULL, NULL, DATEADD(DAY, -20, SYSDATETIMEOFFSET())
);

INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-0006'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-0006'),
    3200000, 480000, 2720000,
    N'Approved', N'BankTransfer', NULL, NULL, DATEADD(DAY, -18, SYSDATETIMEOFFSET())
);

-- 2 Payouts chờ duyệt (Pending)
INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-0007'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-0007'),
    2400000, 360000, 2040000,
    N'Pending', N'Manual', NULL, NULL, DATEADD(DAY, -10, SYSDATETIMEOFFSET())
);

INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-0008'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-0008'),
    7800000, 1170000, 6630000,
    N'Pending', N'Manual', NULL, NULL, DATEADD(DAY, -8, SYSDATETIMEOFFSET())
);

-- 1 Payout bị từ chối (Rejected)
INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount,
     Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
VALUES (
    (SELECT UserId FROM Bookings WHERE BookingCode = N'VN-FIN-REJ1'),
    (SELECT Id     FROM Bookings WHERE BookingCode = N'VN-FIN-REJ1'),
    1500000, 225000, 1275000,
    N'Rejected', N'Manual', NULL, NULL, DATEADD(DAY, -10, SYSDATETIMEOFFSET())
);
GO


/* ---------------------------------------------------------------------
   KIỂM TRA: chạy câu này để xem dữ liệu vừa tạo
   --------------------------------------------------------------------- */

SELECT
    pp.Id,
    u.FullName        AS Partner,
    u.Email           AS PartnerEmail,
    b.BookingCode,
    b.ServiceType,
    b.Status          AS BookingStatus,
    b.PaymentStatus,
    pp.GrossAmount,
    pp.CommissionAmount,
    pp.NetAmount,
    pp.Status         AS PayoutStatus,
    pp.PayoutMethod,
    pp.PaidAt,
    pp.TransactionReference,
    pp.CreatedAt
FROM PartnerPayouts pp
INNER JOIN Users    u ON u.Id = pp.PartnerId
INNER JOIN Bookings b ON b.Id = pp.BookingId
ORDER BY pp.CreatedAt DESC;
