namespace WanderVN.Application.DTOs.Payments;

public class PaymentRequestDto
{
    public int? BookingId { get; set; }
    public decimal Amount { get; set; }
    public string? Method { get; set; }
    public string? TransactionId { get; set; }
}
