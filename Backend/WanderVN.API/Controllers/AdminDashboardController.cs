using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Admin.Dashboard.Queries.GetDashboardStats;

namespace WanderVN.API.Controllers;

[Route("api/v1/admin/dashboard")]
[ApiController]
public class AdminDashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminDashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET api/v1/admin/dashboard/stats
    /// Trả về toàn bộ dữ liệu thống kê cho trang Admin Dashboard.
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
    {
        var stats = await _mediator.Send(new GetDashboardStatsQuery(), cancellationToken);
        var response = new ApiResponse<AdminDashboardStatsDto>(true, "Lấy thống kê dashboard thành công.", 200, stats);
        return Ok(response);
    }
}
