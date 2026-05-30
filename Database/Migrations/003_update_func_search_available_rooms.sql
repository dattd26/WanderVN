USE WanderVN;
GO

ALTER FUNCTION [dbo].[fn_GetAvailableRoomCount] 
(
    @RoomTypeId INT,
    @CheckIn DATE,
    @CheckOut DATE
)
RETURNS INT
AS
BEGIN
    -- Kiểm tra tính hợp lệ của ngày đặt phòng (Check-in phải trước Check-out)
    IF @CheckIn IS NULL OR @CheckOut IS NULL OR @CheckIn >= @CheckOut
    BEGIN
        RETURN 0;
    END;

    DECLARE @TotalRooms INT;
    DECLARE @BookedRooms INT;
    SELECT @TotalRooms = TotalRooms FROM RoomTypes WHERE Id = @RoomTypeId;

    SELECT @BookedRooms = COUNT(bd.Id)
    FROM BookingHotels bd
    JOIN Rooms r ON bd.RoomId = r.Id
    JOIN Bookings b ON bd.BookingId = b.Id
    WHERE r.RoomTypeId = @RoomTypeId
      AND b.Status <> 3 -- Cancelled
      AND NOT (bd.CheckOutDate <= @CheckIn OR bd.CheckInDate >= @CheckOut);

    RETURN ISNULL(@TotalRooms, 0) - ISNULL(@BookedRooms, 0);
END;
GO