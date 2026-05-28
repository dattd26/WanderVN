using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Common.Models;
using WanderVN.Application.Features.Admin.Hotels.Commands.ApproveHotel;
using WanderVN.Application.Features.Admin.Hotels.Commands.RejectHotel;
using WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelReviewCounts;
using WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelReviewDetail;
using WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelsForReview;

namespace WanderVN.API.Controllers;

/// <summary>
/// Controller cho Admin duyệt hồ sơ khách sạn do Partner submit.
/// </summary>
[Route("api/v1/admin/hotels")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminHotelsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminHotelsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET: api/v1/admin/hotels?status=0&amp;pageNumber=1&amp;pageSize=10
    /// Lấy danh sách hồ sơ khách sạn để duyệt. status: 0=Pending, 1=Approved, 2=Rejected.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetForReview(
        [FromQuery] int? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var data = await _mediator.Send(new GetHotelsForReviewQuery
        {
            Status = status,
            PageNumber = pageNumber,
            PageSize = pageSize,
        });
        return Ok(new ApiResponse<PagedResult<AdminHotelListItemDto>>(
            true, "Lấy danh sách hồ sơ thành công", 200, data));
    }

    /// <summary>
    /// GET: api/v1/admin/hotels/counts
    /// Đếm số hồ sơ theo từng trạng thái để hiển thị badge ở tab.
    /// </summary>
    [HttpGet("counts")]
    public async Task<IActionResult> GetCounts()
    {
        var data = await _mediator.Send(new GetHotelReviewCountsQuery());
        return Ok(new ApiResponse<HotelReviewCountsDto>(true, "OK", 200, data));
    }

    /// <summary>
    /// GET: api/v1/admin/hotels/{id}
    /// Chi tiết một hồ sơ khách sạn.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDetail(int id)
    {
        var data = await _mediator.Send(new GetHotelReviewDetailQuery(id));
        if (data is null)
            return NotFound(new ApiResponse<object>(false, "Không tìm thấy hồ sơ", 404, null!));
        return Ok(new ApiResponse<AdminHotelDetailDto>(true, "OK", 200, data));
    }

    /// <summary>
    /// POST: api/v1/admin/hotels/{id}/approve
    /// Duyệt hồ sơ → Status=1, ApprovedAt=now.
    /// </summary>
    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var result = await _mediator.Send(new ApproveHotelCommand(id));
        return result.Success
            ? Ok(new ApiResponse<object>(true, result.Message, 200, null!))
            : BadRequest(new ApiResponse<object>(false, result.Message, 400, null!));
    }

    /// <summary>
    /// POST: api/v1/admin/hotels/{id}/reject  body: { "reason": "..." }
    /// Từ chối hồ sơ → Status=2, RejectReason=reason.
    /// </summary>
    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectHotelRequest body)
    {
        var reason = body?.Reason ?? string.Empty;
        var result = await _mediator.Send(new RejectHotelCommand(id, reason));
        return result.Success
            ? Ok(new ApiResponse<object>(true, result.Message, 200, null!))
            : BadRequest(new ApiResponse<object>(false, result.Message, 400, null!));
    }

    public record RejectHotelRequest(string Reason);
}
