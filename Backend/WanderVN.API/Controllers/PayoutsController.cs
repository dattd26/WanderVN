using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Payouts.Commands.ConfirmPayout;
using WanderVN.Application.Features.Payouts.Commands.RejectPayout;
using WanderVN.Application.Features.Payouts.Queries.GetPayouts;
using WanderVN.Application.Features.Payouts.Queries.GetPayoutStats;
using WanderVN.Application.Features.Users.Queries.GetUsers;

namespace WanderVN.API.Controllers;

[Route("api/v1/payouts")]
[ApiController]
public class PayoutsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PayoutsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// GET api/v1/payouts
    [HttpGet]
    public async Task<IActionResult> GetPayouts([FromQuery] GetPayoutsQuery query, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(query, cancellationToken);
        var response = new ApiResponse<PagedResult<PayoutDto>>(true, "Lấy danh sách thanh toán đối tác thành công.", 200, data);
        return Ok(response);
    }

    /// GET api/v1/payouts/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GetPayoutStatsQuery(), cancellationToken);
        var response = new ApiResponse<PayoutStatsDto>(true, "Lấy thống kê tài chính thành công.", 200, data);
        return Ok(response);
    }

    /// PUT api/v1/payouts/{id}/confirm
    [HttpPut("{id:int}/confirm")]
    public async Task<IActionResult> ConfirmPayout(int id, [FromBody] ConfirmPayoutCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<bool>(true, "Xác nhận thanh toán cho đối tác thành công.", 200, result);
        return Ok(response);
    }

    /// PUT api/v1/payouts/{id}/reject
    [HttpPut("{id:int}/reject")]
    public async Task<IActionResult> RejectPayout(int id, [FromBody] RejectPayoutCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<bool>(true, "Từ chối khoản thanh toán đối tác thành công.", 200, result);
        return Ok(response);
    }
}
