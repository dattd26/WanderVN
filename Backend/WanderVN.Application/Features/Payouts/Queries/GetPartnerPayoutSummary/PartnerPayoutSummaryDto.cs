namespace WanderVN.Application.Features.Payouts.Queries.GetPartnerPayoutSummary;

public class PartnerPayoutSummaryDto
{
    public decimal GrossTotal { get; set; }
    public decimal CommissionTotal { get; set; }
    public decimal NetTotal { get; set; }
    public decimal PendingBalance { get; set; }
    public decimal PaidThisMonth { get; set; }
    public decimal CommissionRate { get; set; }
}
