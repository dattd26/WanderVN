using MediatR;

namespace WanderVN.Application.Features.Admin.Dashboard.Queries.GetDashboardStats;

/// <summary>
/// MediatR Query để lấy thống kê tổng quan cho trang Admin Dashboard.
/// Không cần tham số đầu vào — luôn trả về snapshot hiện tại.
/// </summary>
public class GetDashboardStatsQuery : IRequest<AdminDashboardStatsDto>
{
}
