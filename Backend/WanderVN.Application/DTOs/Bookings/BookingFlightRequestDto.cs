namespace WanderVN.Application.DTOs.Bookings;

public class BookingFlightRequestDto
{
    public int? BookingId { get; set; }
    public int? FlightId { get; set; }
    public string? PassengerName { get; set; }
    public string? PassportNumber { get; set; }
    public string? SeatNumber { get; set; }
}
