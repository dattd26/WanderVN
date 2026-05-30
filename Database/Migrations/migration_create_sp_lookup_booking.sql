CREATE OR ALTER PROCEDURE sp_LookupBooking
    @BookingCode NVARCHAR(100),
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NormalizedEmail NVARCHAR(255) = LOWER(LTRIM(RTRIM(@Email)));
    DECLARE @BookingId INT, @ServiceType NVARCHAR(50), @UserId INT;

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
        b.ServiceType,
        b.TotalPrice,
        ISNULL(b.Status, 'Pending') AS Status,
        ISNULL(b.PaymentStatus, 'Unpaid') AS PaymentStatus,
        ISNULL(b.CreatedAt, GETUTCDATE()) AS CreatedAt,
        ISNULL(b.CustomerName, '') AS CustomerName,
        ISNULL(b.Email, '') AS Email,
        ISNULL(b.CustomerPhone, '') AS CustomerPhone,
        
        -- Hotel Details (if ServiceType = Hotel)
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
    LEFT JOIN BookingHotels bh ON b.Id = bh.BookingId AND b.ServiceType = 'Hotel'
    LEFT JOIN Rooms r ON bh.RoomId = r.Id
    LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.Id
    LEFT JOIN Hotels h ON rt.HotelId = h.Id
    WHERE b.Id = @BookingId;

END;
GO
