namespace WanderVN.Application.Features.Payouts.Queries.GetPayouts;

public class PayoutDto
{
    public int Id { get; set; }

    // Partner info
    public int PartnerId { get; set; }
    public string? PartnerName { get; set; }
    public string? PartnerEmail { get; set; }
    public string? PartnerAvatarUrl { get; set; }

    // Booking info
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public string? BookingStatus { get; set; }
    public string? PaymentStatus { get; set; }
    public DateTimeOffset? BookingCreatedAt { get; set; }

    // Tài chính
    public decimal GrossAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }

    // Payout
    public string Status { get; set; } = "Pending";
    public string PayoutMethod { get; set; } = "Manual";
    public DateTimeOffset? PaidAt { get; set; }
    public string? TransactionReference { get; set; }
    public DateTimeOffset? CheckedOutAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
