using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Payouts.Commands.ConfirmPayout;
using WanderVN.Application.Features.Payouts.Commands.RejectPayout;
using WanderVN.Application.Features.Payouts.Queries.GetPayouts;
using WanderVN.Application.Features.Payouts.Queries.GetPayoutStats;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using WanderVN.Application.Features.Payouts.Queries.GetPartnerBatches;
using WanderVN.Application.Features.Payouts.Queries.GetPartnerPayoutSummary;
using WanderVN.Application.Features.Payouts.Queries.GetPartnerTransactions;
using WanderVN.Application.Features.Payouts.Commands.CreateBatch;
using WanderVN.Application.Features.Payouts.Commands.ConfirmBatch;
using WanderVN.Application.Features.Payouts.Commands.CancelBatch;
using WanderVN.Application.Features.Payouts.Queries.GetUnbatchedPayouts;
using WanderVN.Application.Features.Payouts.Queries.GetAdminBatches;
using WanderVN.Application.Features.Payouts.Queries.GetAdminBatchDetail;
using WanderVN.Application.Features.Payouts.Queries.GeneratePayoutQR;
using WanderVN.Application.Features.Payouts.Queries.GenerateBatchPayoutQR;

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
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPayouts([FromQuery] GetPayoutsQuery query, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(query, cancellationToken);
        var response = new ApiResponse<PagedResult<PayoutDto>>(true, "Lấy danh sách thanh toán đối tác thành công.", 200, data);
        return Ok(response);
    }

    /// GET api/v1/payouts/stats
    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GetPayoutStatsQuery(), cancellationToken);
        var response = new ApiResponse<PayoutStatsDto>(true, "Lấy thống kê tài chính thành công.", 200, data);
        return Ok(response);
    }

    /// PUT api/v1/payouts/{id}/confirm
    [HttpPut("{id:int}/confirm")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ConfirmPayout(int id, [FromBody] ConfirmPayoutCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<bool>(true, "Xác nhận thanh toán cho đối tác thành công.", 200, result);
        return Ok(response);
    }

    /// PUT api/v1/payouts/{id}/reject
    [HttpPut("{id:int}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectPayout(int id, [FromBody] RejectPayoutCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<bool>(true, "Từ chối khoản thanh toán đối tác thành công.", 200, result);
        return Ok(response);
    }

    // ==========================================
    // PARTNER ENDPOINTS
    // ==========================================

    [HttpGet("partner/summary")]
    [Authorize(Roles = "Partner")]
    public async Task<IActionResult> GetPartnerSummary(CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GetPartnerPayoutSummaryQuery(), cancellationToken);
        var response = new ApiResponse<PartnerPayoutSummaryDto>(true, "Lấy tổng quan tài chính đối tác thành công.", 200, data);
        return Ok(response);
    }

    [HttpGet("partner/transactions")]
    [Authorize(Roles = "Partner")]
    public async Task<IActionResult> GetPartnerTransactions([FromQuery] WanderVN.Application.Features.Payouts.Queries.GetPartnerTransactions.GetPartnerTransactionsQuery query, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(query, cancellationToken);
        var response = new ApiResponse<PagedResult<PayoutDto>>(true, "Lấy danh sách giao dịch đối tác thành công.", 200, data);
        return Ok(response);
    }

    [HttpGet("partner/batches")]
    [Authorize(Roles = "Partner")]
    public async Task<IActionResult> GetPartnerBatches([FromQuery] GetPartnerBatchesQuery query, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(query, cancellationToken);
        var response = new ApiResponse<PagedResult<PartnerBatchDto>>(true, "Lấy danh sách đợt chi trả thành công.", 200, data);
        return Ok(response);
    }

    // ==========================================
    // ADMIN BATCH MANAGEMENT ENDPOINTS
    // ==========================================

    [HttpGet("batches")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminBatches([FromQuery] GetAdminBatchesQuery query, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(query, cancellationToken);
        var response = new ApiResponse<PagedResult<AdminBatchDto>>(true, "Lấy danh sách đợt chi trả thành công.", 200, data);
        return Ok(response);
    }

    [HttpGet("batches/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminBatchDetail(int id, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GetAdminBatchDetailQuery { Id = id }, cancellationToken);
        var response = new ApiResponse<AdminBatchDto>(true, "Lấy chi tiết đợt chi trả thành công.", 200, data);
        return Ok(response);
    }

    [HttpGet("unbatched/{partnerId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUnbatchedPayouts(int partnerId, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GetUnbatchedPayoutsQuery { PartnerId = partnerId }, cancellationToken);
        var response = new ApiResponse<List<PayoutDto>>(true, "Lấy danh sách khoản chi trả chưa gom thành công.", 200, data);
        return Ok(response);
    }

    [HttpPost("batches")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateBatch([FromBody] CreateBatchCommand command, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<int>(true, "Tạo đợt chi trả thành công.", 201, data);
        return Ok(response);
    }

    [HttpPut("batches/{id:int}/confirm")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ConfirmBatch(int id, [FromBody] ConfirmBatchCommand command, CancellationToken cancellationToken)
    {
        command.BatchId = id;
        var data = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<bool>(true, "Xác nhận chi trả đợt thành công.", 200, data);
        return Ok(response);
    }

    [HttpPut("batches/{id:int}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CancelBatch(int id, [FromBody] CancelBatchCommand command, CancellationToken cancellationToken)
    {
        command.BatchId = id;
        var data = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<bool>(true, "Hủy đợt chi trả thành công.", 200, data);
        return Ok(response);
    }

    /// GET api/v1/payouts/{id:int}/vietqr
    [HttpGet("{id:int}/vietqr")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPayoutQR(int id, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GeneratePayoutQRQuery { Id = id }, cancellationToken);
        var response = new ApiResponse<PayoutQRDto>(true, "Tạo mã QR thanh toán thành công.", 200, data);
        return Ok(response);
    }

    /// GET api/v1/payouts/batches/{id:int}/vietqr
    [HttpGet("batches/{id:int}/vietqr")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetBatchPayoutQR(int id, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new GenerateBatchPayoutQRQuery { BatchId = id }, cancellationToken);
        var response = new ApiResponse<PayoutQRDto>(true, "Tạo mã QR thanh toán đợt thành công.", 200, data);
        return Ok(response);
    }
}

