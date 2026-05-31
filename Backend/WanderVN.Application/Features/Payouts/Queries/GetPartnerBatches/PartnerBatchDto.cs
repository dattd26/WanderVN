namespace WanderVN.Application.Features.Payouts.Queries.GetPartnerBatches;

public class PartnerBatchDto
{
    public int Id { get; set; }
    public string BatchCode { get; set; } = string.Empty;
    public decimal TotalGross { get; set; }
    public decimal TotalCommission { get; set; }
    public decimal TotalNet { get; set; }
    public int BookingCount { get; set; }
    public string Status { get; set; } = "Processing";
    public string? Note { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public string? TransactionReference { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // We can include a simplified list of booking IDs or payouts inside the batch
    public List<BatchPayoutDto> Payouts { get; set; } = new();
}

public class BatchPayoutDto
{
    public int Id { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public decimal NetAmount { get; set; }
}
