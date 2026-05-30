CREATE OR ALTER PROCEDURE sp_Partner_GetHotelBookings
    @HotelId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        b.Id AS BookingId,
        b.BookingCode AS Id,
        COALESCE(u.FullName, b.CustomerName) AS GuestName,
        COALESCE(u.Email, b.Email) AS Email,
        COALESCE(rt.Name, N'Hạng phòng ẩn') AS RoomTypeName,
        CONVERT(varchar(10), bh.CheckInDate, 120) AS CheckIn,
        CONVERT(varchar(10), bh.CheckOutDate, 120) AS CheckOut,
        b.TotalPrice AS TotalPrice,
        CASE b.Status 
            WHEN 0 THEN 'Pending' 
            WHEN 1 THEN 'Confirmed' 
            WHEN 2 THEN 'Completed' 
            WHEN 3 THEN 'Cancelled' 
            WHEN 4 THEN 'SettlementPending' 
            WHEN 5 THEN 'Settled' 
            WHEN 6 THEN 'CheckedIn' 
            WHEN 7 THEN 'CheckedOut' 
            WHEN 8 THEN 'NoShow' 
            ELSE 'Unknown' 
        END AS Status,
        NULL AS SpecialRequests
    FROM BookingHotels bh
    INNER JOIN Bookings b ON bh.BookingId = b.Id
    LEFT JOIN Users u ON b.UserId = u.Id
    INNER JOIN Rooms r ON bh.RoomId = r.Id
    LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.Id
    WHERE r.HotelId = @HotelId
    ORDER BY b.BookingCode DESC;
END
