using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Enums;

namespace WanderVN.Application.Features.Admin.Dashboard.Queries.GetDashboardStats;

/// <summary>
/// Handler truy vấn dữ liệu thống kê cho Admin Dashboard.
/// Sử dụng IApplicationDbContext để truy cập trực tiếp các DbSet, tối ưu cho read-only queries.
/// </summary>
public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, AdminDashboardStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var sixtyDaysAgo = now.AddDays(-60);

        // ═══════════════════════════════════════════
        // 1. KPI: Total Users (Customer role)
        // ═══════════════════════════════════════════
        var totalUsers = await _context.Users
            .Where(u => u.Role != null && u.Role.Name == "Customer")
            .CountAsync(cancellationToken);

        var usersLast30 = await _context.Users
            .Where(u => u.Role != null && u.Role.Name == "Customer" && u.CreatedAt >= thirtyDaysAgo)
            .CountAsync(cancellationToken);

        var usersPrev30 = await _context.Users
            .Where(u => u.Role != null && u.Role.Name == "Customer" && u.CreatedAt >= sixtyDaysAgo && u.CreatedAt < thirtyDaysAgo)
            .CountAsync(cancellationToken);

        var userGrowth = CalculateGrowthPercent(usersLast30, usersPrev30);

        // ═══════════════════════════════════════════
        // 2. KPI: Total Revenue (từ bảng Payments)
        // ═══════════════════════════════════════════
        var totalRevenue = await _context.Payments
            .SumAsync(p => (decimal?)p.Amount ?? 0, cancellationToken);

        var revenueLast30 = await _context.Payments
            .Where(p => p.PaymentDate >= thirtyDaysAgo)
            .SumAsync(p => (decimal?)p.Amount ?? 0, cancellationToken);

        var revenuePrev30 = await _context.Payments
            .Where(p => p.PaymentDate >= sixtyDaysAgo && p.PaymentDate < thirtyDaysAgo)
            .SumAsync(p => (decimal?)p.Amount ?? 0, cancellationToken);

        var revenueGrowth = CalculateGrowthPercent(revenueLast30, revenuePrev30);

        // ═══════════════════════════════════════════
        // 3. KPI: Active Partners
        // ═══════════════════════════════════════════
        var activePartners = await _context.Users
            .Where(u => u.Role != null && u.Role.Name == "Partner" && u.Status == 1 && u.IsActive == true)
            .CountAsync(cancellationToken);

        // ═══════════════════════════════════════════
        // 4. KPI: New Bookings (30 ngày)
        // ═══════════════════════════════════════════
        var newBookings = await _context.Bookings
            .Where(b => b.CreatedAt >= thirtyDaysAgo)
            .CountAsync(cancellationToken);

        var bookingsPrev30 = await _context.Bookings
            .Where(b => b.CreatedAt >= sixtyDaysAgo && b.CreatedAt < thirtyDaysAgo)
            .CountAsync(cancellationToken);

        var bookingGrowth = CalculateGrowthPercent(newBookings, bookingsPrev30);

        // ═══════════════════════════════════════════
        // 5. Monthly Revenue (12 tháng gần nhất)
        // ═══════════════════════════════════════════
        var twelveMonthsAgo = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero).AddMonths(-11);

        var monthlyRevenue = await _context.Payments
            .Where(p => p.PaymentDate >= twelveMonthsAgo)
            .GroupBy(p => new { p.PaymentDate!.Value.Year, p.PaymentDate!.Value.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Amount = g.Sum(p => p.Amount)
            })
            .OrderBy(g => g.Year).ThenBy(g => g.Month)
            .ToListAsync(cancellationToken);

        var monthNames = new[] { "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC" };

        // Tạo đủ 12 tháng, fill 0 cho tháng không có dữ liệu
        var monthlyRevenueList = new List<MonthlyRevenueDto>();
        for (int i = 0; i < 12; i++)
        {
            var targetDate = twelveMonthsAgo.AddMonths(i);
            var data = monthlyRevenue.FirstOrDefault(m => m.Year == targetDate.Year && m.Month == targetDate.Month);
            monthlyRevenueList.Add(new MonthlyRevenueDto
            {
                Month = monthNames[targetDate.Month - 1],
                Amount = data?.Amount ?? 0
            });
        }

        // ═══════════════════════════════════════════
        // 6. Revenue Distribution: Stays vs Flights
        // ═══════════════════════════════════════════
        var revenueByServiceType = await _context.Bookings
            .Where(b => b.Payments.Any())
            .GroupBy(b => b.ServiceType)
            .Select(g => new
            {
                ServiceType = g.Key,
                Total = g.Sum(b => b.TotalPrice)
            })
            .ToListAsync(cancellationToken);

        var staysRevenue = revenueByServiceType
            .Where(r => r.ServiceType == BookingServiceType.Hotel)
            .Sum(r => r.Total);

        var flightsRevenue = revenueByServiceType
            .Where(r => r.ServiceType == BookingServiceType.Flight)
            .Sum(r => r.Total);

        var totalServiceRevenue = staysRevenue + flightsRevenue;
        var staysPercent = totalServiceRevenue > 0 ? Math.Round(staysRevenue / totalServiceRevenue * 100, 1) : 0;
        var flightsPercent = totalServiceRevenue > 0 ? Math.Round(flightsRevenue / totalServiceRevenue * 100, 1) : 0;

        // ═══════════════════════════════════════════
        // 7. Recent Activities (10 mục gần nhất)
        // ═══════════════════════════════════════════
        var recentBookings = await _context.Bookings
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => new RecentActivityDto
            {
                Type = "booking",
                Title = "Booking " + b.BookingCode,
                Detail = b.CustomerName + " — " + b.TotalPrice.ToString("N0") + " VND",
                Time = b.CreatedAt ?? DateTimeOffset.MinValue
            })
            .ToListAsync(cancellationToken);

        var recentPartners = await _context.Users
            .Where(u => u.Role != null && u.Role.Name == "Partner")
            .OrderByDescending(u => u.CreatedAt)
            .Take(5)
            .Select(u => new RecentActivityDto
            {
                Type = "partner",
                Title = "Partner: " + (u.FullName ?? u.Email),
                Detail = u.Status == 0 ? "Chờ duyệt" : u.Status == 1 ? "Đã duyệt" : "Bị từ chối",
                Time = u.CreatedAt ?? DateTimeOffset.MinValue
            })
            .ToListAsync(cancellationToken);

        var recentActivities = recentBookings
            .Concat(recentPartners)
            .OrderByDescending(a => a.Time)
            .Take(10)
            .ToList();

        // ═══════════════════════════════════════════
        // Build final DTO
        // ═══════════════════════════════════════════
        return new AdminDashboardStatsDto
        {
            TotalUsers = totalUsers,
            UserGrowthPercent = userGrowth,
            TotalRevenue = totalRevenue,
            RevenueGrowthPercent = revenueGrowth,
            ActivePartners = activePartners,
            NewBookings = newBookings,
            BookingGrowthPercent = bookingGrowth,
            MonthlyRevenue = monthlyRevenueList,
            StaysRevenuePercent = staysPercent,
            FlightsRevenuePercent = flightsPercent,
            RecentActivities = recentActivities
        };
    }

    /// <summary>
    /// Tính phần trăm tăng trưởng giữa hai giai đoạn.
    /// Trả về 0 nếu giai đoạn trước = 0 và giai đoạn hiện tại cũng = 0.
    /// Trả về 100 nếu giai đoạn trước = 0 nhưng giai đoạn hiện tại > 0.
    /// </summary>
    private static decimal CalculateGrowthPercent(decimal current, decimal previous)
    {
        if (previous == 0)
            return current > 0 ? 100m : 0m;

        return Math.Round((current - previous) / previous * 100, 1);
    }
}
