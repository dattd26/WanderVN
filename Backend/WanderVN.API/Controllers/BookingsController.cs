using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Bookings.Commands.CreateHotelBooking;
using WanderVN.Application.Features.Bookings.Commands.CreateFlightBooking;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.API.Controllers;

[Route("api/v1/bookings")]
[ApiController]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("hotel")]
    public async Task<IActionResult> CreateHotelBooking([FromBody] CreateHotelBookingRequest request)
    {
        var command = new CreateHotelBookingCommand { Request = request };
        var result = await _mediator.Send(command);
        var response = new ApiResponse<HotelBookingResponse>(true, "Dat phong thanh cong", 200, result);
        return Ok(response);
    }

    [HttpPost("flight")]
    public async Task<IActionResult> CreateFlightBooking([FromBody] CreateFlightBookingRequest request)
    {
        var command = new CreateFlightBookingCommand { Request = request };
        var result = await _mediator.Send(command);
        var response = new ApiResponse<FlightBookingResponse>(true, "Dat ve may bay thanh cong", 200, result);
        return Ok(response);
    }
}
