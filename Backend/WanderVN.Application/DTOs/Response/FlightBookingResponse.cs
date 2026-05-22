namespace WanderVN.Application.DTOs.Response;

public class FlightBookingResponse
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty; // Duffel Order ID
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
}
