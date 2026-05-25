using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Flights.Queries.GetFlightOfferDetail;

namespace WanderVN.API.Controllers;

/// <summary>
/// Controller xử lý các endpoint liên quan đến chuyến bay (Flights).
/// Route: api/v1/flights
/// </summary>
[Route("api/v1/flights")]
[ApiController]
public class FlightsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FlightsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET: api/v1/flights/offers/{offerId}
    /// Lấy chi tiết đầy đủ một Offer từ Duffel API theo ID.
    /// Reference: https://duffel.com/docs/api/v2/offers/get-offer-by-id
    /// </summary>
    [HttpGet("offers/{offerId}")]
    public async Task<IActionResult> GetFlightOfferDetail([FromRoute] string offerId)
    {
        Console.WriteLine($"[FlightsController] GET offers/{offerId}");

        var query = new GetFlightOfferDetailQuery { OfferId = offerId };
        var data = await _mediator.Send(query);

        var response = new ApiResponse<GetFlightOfferDetailDto>(
            true,
            "Lấy chi tiết chuyến bay thành công!",
            200,
            data
        );

        return Ok(response);
    }
}
