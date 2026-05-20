using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Hotels.Queries.GetHotelDetail;

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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetHotelDetail([FromRoute] int id)
    {
        var query = new GetHotelDetailQuery { HotelId = id };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new ErrorResponse("Hotel not found", 404));

        return Ok(new ApiResponse<HotelDetailDto>(true, "Hotel detail fetched", 200, result));
    }
}
