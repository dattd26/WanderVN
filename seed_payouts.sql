USE [WanderVN]
GO

/* =====================================================================
   SEED DEMO: Partner Payouts + Bookings
   Mục đích: Tạo dữ liệu mẫu cho trang AdminFinance.
   Luồng Booking: Unpaid -> Paid -> Confirmed -> CheckedIn/Completed
                  -> SettlementPending -> Settled
   Status Payout: Pending -> Approved -> Paid / Rejected
   ===================================================================== */

SET NOCOUNT ON;

-- 1) Kiểm tra phải có ít nhất 1 Partner (user có RoleId của 'Partner')
DECLARE @PartnerRoleId INT = (SELECT TOP 1 Id FROM [dbo].[Roles] WHERE Name = N'Partner');

IF @PartnerRoleId IS NULL
BEGIN
    PRINT 'Chưa có Role "Partner" trong bảng Roles. Hãy seed Roles trước khi chạy.';
    RETURN;
END

-- Lấy tối đa 5 partner đầu tiên để tạo dữ liệu
DECLARE @Partners TABLE (RowId INT IDENTITY(1,1), PartnerId INT);
INSERT INTO @Partners (PartnerId)
SELECT TOP (5) Id FROM [dbo].[Users] WHERE RoleId = @PartnerRoleId ORDER BY Id;

IF NOT EXISTS (SELECT 1 FROM @Partners)
BEGIN
    PRINT 'Chưa có user nào có Role = Partner. Hãy tạo Partner rồi chạy lại.';
    RETURN;
END

-- 2) Tạo Bookings mẫu với đa dạng Status / PaymentStatus
DECLARE @NewBookings TABLE (Id INT, PartnerId INT, Gross DECIMAL(18,2));

DECLARE @i INT = 1;
DECLARE @count INT = (SELECT COUNT(*) FROM @Partners);
DECLARE @partnerId INT;
DECLARE @gross DECIMAL(18,2);
DECLARE @serviceType NVARCHAR(50);
DECLARE @bookingStatus NVARCHAR(50);
DECLARE @paymentStatus NVARCHAR(50);
DECLARE @bookingCode NVARCHAR(50);
DECLARE @bookingId INT;

WHILE @i <= 12
BEGIN
    -- Round-robin partner
    SELECT @partnerId = PartnerId FROM @Partners WHERE RowId = ((@i - 1) % @count) + 1;

    SET @gross = 1500000 + (ABS(CHECKSUM(NEWID())) % 8000000); -- 1.5tr - 9.5tr
    SET @serviceType = CASE (@i % 3) WHEN 0 THEN N'Hotel' WHEN 1 THEN N'Flight' ELSE N'Hotel' END;

    -- Distribute statuses across the booking lifecycle
    SET @bookingStatus = CASE (@i % 6)
        WHEN 0 THEN N'Unpaid'
        WHEN 1 THEN N'Paid'
        WHEN 2 THEN N'Confirmed'
        WHEN 3 THEN N'Completed'
        WHEN 4 THEN N'SettlementPending'
        ELSE N'Settled'
    END;
    SET @paymentStatus = CASE
        WHEN @bookingStatus = N'Unpaid' THEN N'Unpaid'
        WHEN @bookingStatus = N'Paid' THEN N'Paid'
        WHEN @bookingStatus IN (N'Confirmed', N'Completed', N'SettlementPending') THEN N'Paid'
        WHEN @bookingStatus = N'Settled' THEN N'Paid'
        ELSE N'Unpaid'
    END;
    SET @bookingCode = CONCAT(N'VN-DEMO-', FORMAT(GETUTCDATE(), 'yyMMdd'), '-', RIGHT('000' + CAST(@i AS NVARCHAR(10)), 3));

    INSERT INTO [dbo].[Bookings] (UserId, BookingCode, ServiceType, TotalPrice, Status, PaymentStatus, CreatedAt)
    VALUES (@partnerId, @bookingCode, @serviceType, @gross, @bookingStatus, @paymentStatus, SYSDATETIMEOFFSET());

    SET @bookingId = SCOPE_IDENTITY();
    INSERT INTO @NewBookings (Id, PartnerId, Gross) VALUES (@bookingId, @partnerId, @gross);

    SET @i = @i + 1;
END

-- 3) Tạo PartnerPayouts cho các booking đã đạt giai đoạn cần đối soát
--    (Completed / SettlementPending / Settled). Pending vs Paid status mỗi loại.
DECLARE @rate DECIMAL(5,4) = 0.15; -- Hoa hồng nền tảng 15%

INSERT INTO [dbo].[PartnerPayouts]
    (PartnerId, BookingId, GrossAmount, CommissionAmount, NetAmount, Status, PayoutMethod, PaidAt, TransactionReference, CreatedAt)
SELECT
    nb.PartnerId,
    nb.Id,
    nb.Gross,
    CAST(nb.Gross * @rate AS DECIMAL(18,2)),
    CAST(nb.Gross - (nb.Gross * @rate) AS DECIMAL(18,2)),
    CASE b.Status
        WHEN N'Completed'         THEN N'Pending'
        WHEN N'SettlementPending' THEN N'Approved'
        WHEN N'Settled'           THEN N'Paid'
        ELSE N'Pending'
    END AS Status,
    CASE b.Status WHEN N'Settled' THEN N'BankTransfer' ELSE N'Manual' END AS PayoutMethod,
    CASE b.Status WHEN N'Settled' THEN SYSDATETIMEOFFSET() ELSE NULL END AS PaidAt,
    CASE b.Status WHEN N'Settled' THEN CONCAT(N'TXN-', RIGHT(CAST(NEWID() AS NVARCHAR(36)), 8)) ELSE NULL END AS TransactionReference,
    SYSDATETIMEOFFSET()
FROM @NewBookings nb
INNER JOIN [dbo].[Bookings] b ON b.Id = nb.Id
WHERE b.Status IN (N'Completed', N'SettlementPending', N'Settled');

PRINT N'Seed AdminFinance hoàn tất.';
PRINT N'- Bookings tạo mới: ' + CAST((SELECT COUNT(*) FROM @NewBookings) AS NVARCHAR(10));
PRINT N'- Payouts tạo mới : ' + CAST(@@ROWCOUNT AS NVARCHAR(10));

GO
