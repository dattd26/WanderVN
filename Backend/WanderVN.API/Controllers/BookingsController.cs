using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Bookings.Commands.CreateFlightBooking;
using WanderVN.Application.Features.Bookings.Commands.CreateHotelBooking;
using WanderVN.Application.Features.Bookings.Queries.GetBookingHistory;
using WanderVN.Application.Features.Bookings.Queries.GetBookingDetail;
using WanderVN.Application.Features.Bookings.Queries.LookupBooking;

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
    [HttpPut("{bookingId}/checkout")]
    public async Task<IActionResult> CheckOutBooking([FromRoute] int bookingId)
    {
        try
        {
            var command = new WanderVN.Application.Features.Bookings.Commands.CheckOutBooking.CheckOutBookingCommand { BookingId = bookingId };
            var result = await _mediator.Send(command);

            if (!result)
                return NotFound(new ApiResponse<object>(false, "Cannot checkout booking", 404, null));

            return Ok(new ApiResponse<object>(true, "Booking checked out", 200, null));
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, 500, null));
        }
    }

    [HttpGet("{bookingId:int}")]
    public async Task<IActionResult> GetBookingDetail([FromRoute] int bookingId)
    {
        try
        {
            var query = new GetBookingDetailQuery { BookingId = bookingId };
            var result = await _mediator.Send(query);

            if (result == null)
            {
                return NotFound(new ApiResponse<object>(false, "Không tìm thấy đơn đặt chỗ hợp lệ.", 404, null));
            }

            var response = new ApiResponse<object>(
                true,
                "Lấy chi tiết đặt phòng/vé máy bay thành công",
                200,
                result
            );

            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, 500, null));
        }
    }
    [HttpPut("{bookingId}/cancel")]
    public async Task<IActionResult> CancelBooking([FromRoute] int bookingId)
    {
        try
        {
            var command = new WanderVN.Application.Features.Bookings.Commands.CancelBooking.CancelBookingCommand { BookingId = bookingId };
            var result = await _mediator.Send(command);

            if (!result)
                return NotFound(new ApiResponse<object>(false, "Cannot cancel booking", 404, null));

            return Ok(new ApiResponse<object>(true, "Booking cancelled", 200, null));
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, 500, null));
        }
    }

    [HttpPost("hotel")]
    public async Task<IActionResult> CreateHotelBooking([FromBody] CreateHotelBookingRequest request)
    {
        try
        {
            var command = new CreateHotelBookingCommand { Request = request };
            var result = await _mediator.Send(command);
            var response = new ApiResponse<HotelBookingResponse>(true, "Dat phong thanh cong", 200, result);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return UnprocessableEntity(new ApiResponse<HotelBookingResponse>(false, ex.Message, 422, null));
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<HotelBookingResponse>(false, ex.Message, 500, null));
        }
    }

    [HttpPost("flight")]
    public async Task<IActionResult> CreateFlightBooking([FromBody] CreateFlightBookingRequest request)
    {
        var command = new CreateFlightBookingCommand { Request = request };
        var result = await _mediator.Send(command);
        var response = new ApiResponse<FlightBookingResponse>(true, "Dat ve may bay thanh cong", 200, result);
        return Ok(response);
    }
    [Authorize]
    [HttpGet("history")]
    public async Task<IActionResult> GetBookingHistory()
    {
        try
        {
            var query = new GetBookingHistoryQuery();
            var result = await _mediator.Send(query);

            var response = new ApiResponse<List<BookingHistoryDto>>(
                true,
                "Lay lich su dat phong thanh cong",
                200,
                result
            );

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse<List<BookingHistoryDto>>(
                false,
                ex.Message,
                401,
                null
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<List<BookingHistoryDto>>(
                false,
                ex.Message,
                500,
                null
            ));
        }
    }

    [HttpPost("lookup")]
    public async Task<IActionResult> LookupBooking([FromBody] LookupBookingQuery request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.BookingCode) || string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new ApiResponse<object>(false, "Vui lòng nhập đầy đủ mã đặt chỗ và email liên hệ.", 400, null));
            }

            var result = await _mediator.Send(request);

            if (result == null)
            {
                return NotFound(new ApiResponse<object>(false, "Không tìm thấy đơn đặt chỗ khớp với mã và email đã nhập.", 404, null));
            }

            return Ok(new ApiResponse<object>(true, "Tra cứu thành công.", 200, result));
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>(false, ex.Message, 500, null));
        }
    }
}
