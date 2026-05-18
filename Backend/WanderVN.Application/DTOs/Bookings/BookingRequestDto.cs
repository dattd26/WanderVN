namespace WanderVN.Application.DTOs.Bookings;

public class BookingRequestDto
{
    public int? UserId { get; set; }
    public string BookingCode { get; set; } = null!;
    public string ServiceType { get; set; } = null!;
    public decimal TotalPrice { get; set; }
    public string? Status { get; set; }
    public string? PaymentStatus { get; set; }
}
