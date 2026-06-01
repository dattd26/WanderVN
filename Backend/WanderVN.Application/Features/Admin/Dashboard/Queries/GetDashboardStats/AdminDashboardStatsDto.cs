namespace WanderVN.Application.Features.Admin.Dashboard.Queries.GetDashboardStats;

/// <summary>
/// DTO chứa toàn bộ dữ liệu thống kê cho trang Admin Dashboard.
/// </summary>
public class AdminDashboardStatsDto
{
    // ── KPI Cards ──

    /// <summary>Tổng số người dùng có role Customer.</summary>
    public int TotalUsers { get; set; }

    /// <summary>Phần trăm tăng trưởng user (30 ngày gần nhất vs 30 ngày trước đó).</summary>
    public decimal UserGrowthPercent { get; set; }

    /// <summary>Tổng doanh thu từ bảng Payments (VND).</summary>
    public decimal TotalRevenue { get; set; }

    /// <summary>Phần trăm tăng trưởng doanh thu (30 ngày gần nhất vs 30 ngày trước đó).</summary>
    public decimal RevenueGrowthPercent { get; set; }

    /// <summary>Số lượng đối tác đang hoạt động (Status = Active & IsActive = true).</summary>
    public int ActivePartners { get; set; }

    /// <summary>Số booking mới trong 30 ngày gần nhất.</summary>
    public int NewBookings { get; set; }

    /// <summary>Phần trăm tăng trưởng booking (30 ngày gần nhất vs 30 ngày trước đó).</summary>
    public decimal BookingGrowthPercent { get; set; }

    // ── Revenue Growth Chart ──

    /// <summary>Doanh thu theo tháng (12 tháng gần nhất).</summary>
    public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();

    // ── Revenue Distribution ──

    /// <summary>Phần trăm doanh thu từ đặt phòng (Stays).</summary>
    public decimal StaysRevenuePercent { get; set; }

    /// <summary>Phần trăm doanh thu từ vé máy bay (Flights).</summary>
    public decimal FlightsRevenuePercent { get; set; }

    // ── Recent Activity ──

    /// <summary>Danh sách hoạt động gần nhất (bookings, partners...).</summary>
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

/// <summary>
/// Doanh thu của một tháng cụ thể cho biểu đồ Revenue Growth.
/// </summary>
public class MonthlyRevenueDto
{
    /// <summary>Tên tháng viết tắt: "JAN", "FEB", "MAR"...</summary>
    public string Month { get; set; } = string.Empty;

    /// <summary>Tổng doanh thu trong tháng (VND).</summary>
    public decimal Amount { get; set; }
}

/// <summary>
/// Một mục hoạt động gần đây hiển thị trong System Logs & Activity.
/// </summary>
public class RecentActivityDto
{
    /// <summary>Loại hoạt động: "partner", "booking", "payout".</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Tiêu đề hoạt động.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Chi tiết hoạt động.</summary>
    public string Detail { get; set; } = string.Empty;

    /// <summary>Thời gian hoạt động.</summary>
    public DateTimeOffset Time { get; set; }
}
