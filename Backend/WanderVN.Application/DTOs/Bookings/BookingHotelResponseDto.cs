namespace WanderVN.Application.DTOs.Bookings;

public class BookingHotelResponseDto
{
    public int Id { get; set; }
    public int? BookingId { get; set; }
    public int? RoomId { get; set; }
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
}
