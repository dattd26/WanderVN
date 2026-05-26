namespace WanderVN.Application.Features.Payouts.Queries.GetPayouts;

public class PayoutStatsDto
{
    /// Tổng số tiền chưa thanh toán (NetAmount của các payout Pending/Approved)
    public decimal TotalNetPending { get; set; }

    /// Tổng hoa hồng (Commission) nền tảng đã thu
    public decimal TotalCommission { get; set; }

    /// Tổng doanh thu nền tảng (Gross)
    public decimal TotalRevenue { get; set; }

    /// Số Partner đang có giao dịch
    public int ActivePartners { get; set; }
}
