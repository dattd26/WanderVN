namespace WanderVN.Application.DTOs.Bookings;

public class BookingResponseDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string BookingCode { get; set; } = null!;
    public string ServiceType { get; set; } = null!;
    public decimal TotalPrice { get; set; }
    public string? Status { get; set; }
    public string? PaymentStatus { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
}
