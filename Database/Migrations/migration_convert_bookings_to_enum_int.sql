USE WanderVN;
GO

-- 1. Chuyển đổi ServiceType từ string sang INT
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND name = 'ServiceType')
BEGIN
    IF EXISTS (
        SELECT * FROM sys.columns c 
        JOIN sys.types t ON c.user_type_id = t.user_type_id 
        WHERE c.object_id = OBJECT_ID(N'[dbo].[Bookings]') 
          AND c.name = 'ServiceType' 
          AND t.name IN ('nvarchar', 'varchar', 'char', 'nchar')
    )
    BEGIN
        ALTER TABLE Bookings ADD ServiceTypeNew INT NOT NULL DEFAULT 0;
        
        EXEC('
            UPDATE Bookings SET ServiceTypeNew = 
                CASE ServiceType 
                    WHEN ''Flight'' THEN 0
                    WHEN ''Hotel'' THEN 1
                    ELSE 0
                END
        ');
        
        ALTER TABLE Bookings DROP COLUMN ServiceType;
        EXEC sp_rename 'Bookings.ServiceTypeNew', 'ServiceType', 'COLUMN';
    END
END
GO

-- 2. Chuyển đổi Status từ string sang INT
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND name = 'Status')
BEGIN
    IF EXISTS (
        SELECT * FROM sys.columns c 
        JOIN sys.types t ON c.user_type_id = t.user_type_id 
        WHERE c.object_id = OBJECT_ID(N'[dbo].[Bookings]') 
          AND c.name = 'Status' 
          AND t.name IN ('nvarchar', 'varchar', 'char', 'nchar')
    )
    BEGIN
        ALTER TABLE Bookings ADD StatusNew INT NOT NULL DEFAULT 0;
        
        EXEC('
            UPDATE Bookings SET StatusNew = 
                CASE Status 
                    WHEN ''Pending'' THEN 0
                    WHEN ''Confirmed'' THEN 1
                    WHEN ''Completed'' THEN 2
                    WHEN ''Cancelled'' THEN 3
                    WHEN ''SettlementPending'' THEN 4
                    ELSE 0
                END
        ');
        
        -- Drop default constraint on Status column if any
        DECLARE @StatusConstraintName NVARCHAR(256);
        SELECT @StatusConstraintName = d.name
        FROM sys.default_constraints d
        INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
        WHERE d.parent_object_id = OBJECT_ID(N'[dbo].[Bookings]')
          AND c.name = 'Status';
          
        IF @StatusConstraintName IS NOT NULL
        BEGIN
            EXEC('ALTER TABLE Bookings DROP CONSTRAINT ' + @StatusConstraintName);
        END

        ALTER TABLE Bookings DROP COLUMN Status;
        EXEC sp_rename 'Bookings.StatusNew', 'Status', 'COLUMN';
    END
END
GO

-- 3. Chuyển đổi PaymentStatus từ string sang INT
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND name = 'PaymentStatus')
BEGIN
    IF EXISTS (
        SELECT * FROM sys.columns c 
        JOIN sys.types t ON c.user_type_id = t.user_type_id 
        WHERE c.object_id = OBJECT_ID(N'[dbo].[Bookings]') 
          AND c.name = 'PaymentStatus' 
          AND t.name IN ('nvarchar', 'varchar', 'char', 'nchar')
    )
    BEGIN
        ALTER TABLE Bookings ADD PaymentStatusNew INT NOT NULL DEFAULT 0;
        
        EXEC('
            UPDATE Bookings SET PaymentStatusNew = 
                CASE PaymentStatus 
                    WHEN ''Unpaid'' THEN 0
                    WHEN ''Paid'' THEN 1
                    WHEN ''Failed'' THEN 2
                    ELSE 0
                END
        ');
        
        -- Drop default constraint on PaymentStatus column if any
        DECLARE @PaymentConstraintName NVARCHAR(256);
        SELECT @PaymentConstraintName = d.name
        FROM sys.default_constraints d
        INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
        WHERE d.parent_object_id = OBJECT_ID(N'[dbo].[Bookings]')
          AND c.name = 'PaymentStatus';
          
        IF @PaymentConstraintName IS NOT NULL
        BEGIN
            EXEC('ALTER TABLE Bookings DROP CONSTRAINT ' + @PaymentConstraintName);
        END

        ALTER TABLE Bookings DROP COLUMN PaymentStatus;
        EXEC sp_rename 'Bookings.PaymentStatusNew', 'PaymentStatus', 'COLUMN';
    END
END
GO

-- 4. Cập nhật Stored Procedure sp_LookupBooking tương thích kiểu INT mới nhưng trả về STRING cho DTO
CREATE OR ALTER PROCEDURE sp_LookupBooking
    @BookingCode NVARCHAR(100),
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NormalizedEmail NVARCHAR(255) = LOWER(LTRIM(RTRIM(@Email)));
    DECLARE @BookingId INT, @ServiceType INT, @UserId INT;

    SELECT @BookingId = Id, @ServiceType = ServiceType, @UserId = UserId
    FROM Bookings
    WHERE BookingCode = @BookingCode;

    IF @BookingId IS NULL
        RETURN;

    DECLARE @EmailMatched BIT = 0;
    
    -- Check if email matches booking email
    IF EXISTS (
        SELECT 1 
        FROM Bookings 
        WHERE Id = @BookingId AND LOWER(LTRIM(RTRIM(Email))) = @NormalizedEmail
    )
    BEGIN
        SET @EmailMatched = 1;
    END
    -- If not matched, check if it matches linked user's email
    ELSE IF @UserId IS NOT NULL
    BEGIN
        IF EXISTS (
            SELECT 1 
            FROM Users 
            WHERE Id = @UserId AND LOWER(LTRIM(RTRIM(Email))) = @NormalizedEmail
        )
        BEGIN
            SET @EmailMatched = 1;
        END
    END

    -- If email doesn't match, return empty
    IF @EmailMatched = 0
        RETURN;

    -- Return the detail matching BookingLookupDetailDto
    SELECT 
        b.Id AS BookingId,
        b.BookingCode,
        CASE b.ServiceType
            WHEN 0 THEN 'Flight'
            WHEN 1 THEN 'Hotel'
            ELSE 'Flight'
        END AS ServiceType,
        b.TotalPrice,
        CASE ISNULL(b.Status, 0)
            WHEN 0 THEN 'Pending'
            WHEN 1 THEN 'Confirmed'
            WHEN 2 THEN 'Completed'
            WHEN 3 THEN 'Cancelled'
            WHEN 4 THEN 'SettlementPending'
            WHEN 5 THEN 'Settled'
            ELSE 'Pending'
        END AS Status,
        CASE ISNULL(b.PaymentStatus, 0)
            WHEN 0 THEN 'Unpaid'
            WHEN 1 THEN 'Paid'
            WHEN 2 THEN 'Failed'
            ELSE 'Unpaid'
        END AS PaymentStatus,
        ISNULL(b.CreatedAt, GETUTCDATE()) AS CreatedAt,
        ISNULL(b.CustomerName, '') AS CustomerName,
        ISNULL(b.Email, '') AS Email,
        ISNULL(b.CustomerPhone, '') AS CustomerPhone,
        
        -- Hotel Details (if ServiceType = Hotel (1))
        h.Name AS HotelName,
        ISNULL(h.Address, '') AS HotelAddress,
        (SELECT TOP 1 ImageUrl FROM HotelImages img WHERE img.HotelId = h.Id ORDER BY IsPrimary DESC) AS HotelImage,
        rt.Name AS RoomTypeName,
        CONVERT(NVARCHAR, bh.CheckInDate, 23) AS CheckInDate,
        CONVERT(NVARCHAR, bh.CheckOutDate, 23) AS CheckOutDate,
        
        -- Flight Details (if ServiceType = Flight)
        (
            SELECT STRING_AGG(ISNULL(bf.PassengerName, 'N/A'), ', ')
            FROM BookingFlights bf
            WHERE bf.BookingId = b.Id
        ) AS PassengerNames
        
    FROM Bookings b
    LEFT JOIN BookingHotels bh ON b.Id = bh.BookingId AND b.ServiceType = 1
    LEFT JOIN Rooms r ON bh.RoomId = r.Id
    LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.Id
    LEFT JOIN Hotels h ON rt.HotelId = h.Id
    WHERE b.Id = @BookingId;

END;
GO
