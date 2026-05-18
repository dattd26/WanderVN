namespace WanderVN.Application.DTOs.Payments;

public class PaymentResponseDto
{
    public int Id { get; set; }
    public int? BookingId { get; set; }
    public decimal Amount { get; set; }
    public string? Method { get; set; }
    public string? TransactionId { get; set; }
    public DateTimeOffset? PaymentDate { get; set; }
}
