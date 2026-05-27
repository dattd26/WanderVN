using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Hotels.Queries.GetHotelDetail;
using WanderVN.Application.Features.Hotels.Queries.GetHotelsReview;
using WanderVN.Application.Features.Hotels.Commands.ApproveHotel;
using WanderVN.Application.Features.Hotels.Commands.RejectHotel;
using WanderVN.Application.Common.Models;
using System.Threading;

namespace WanderVN.API.Controllers;

[Route("api/v1/hotels")]
[ApiController]
public class HotelsController : ControllerBase
{
    private readonly IMediator _mediator;

    public HotelsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetHotelDetail([FromRoute] int id)
    {
        var query = new GetHotelDetailQuery { HotelId = id };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new ErrorResponse("Hotel not found", 404));

        return Ok(new ApiResponse<HotelDetailDto>(true, "Hotel detail fetched", 200, result));
    }

    [HttpGet("review")]
    public async Task<IActionResult> GetHotelsReview(
        [FromQuery] int? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetHotelsReviewQuery
        {
            Status = status,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(new ApiResponse<PagedResult<HotelsReviewDto>>(true, "Lấy danh sách hồ sơ khách sạn cần duyệt thành công.", 200, result));
    }

    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> ApproveHotel(int id, CancellationToken cancellationToken)
    {
        var command = new ApproveHotelCommand { HotelId = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result)
            return NotFound(new ErrorResponse("Không tìm thấy khách sạn.", 404));

        return Ok(new ApiResponse<bool>(true, "Duyệt hồ sơ khách sạn thành công.", 200, true));
    }

    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> RejectHotel(int id, [FromBody] RejectHotelRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RejectReason))
        {
            return BadRequest(new ErrorResponse("Lý do từ chối không được để trống.", 400));
        }

        var command = new RejectHotelCommand { HotelId = id, RejectReason = request.RejectReason };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result)
            return NotFound(new ErrorResponse("Không tìm thấy khách sạn.", 404));

        return Ok(new ApiResponse<bool>(true, "Từ chối hồ sơ khách sạn thành công.", 200, true));
    }
}

public class RejectHotelRequest
{
    public string RejectReason { get; set; } = string.Empty;
}

