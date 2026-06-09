using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Flights.Queries.SearchFlights;
using WanderVN.Application.Features.Hotels.Queries.SearchHotels;
using WanderVN.Application.Features.Hotels.Queries.SearchAutocomplete;
using WanderVN.Application.Features.Flights.Queries.GetAirports;

namespace WanderVN.API.Controllers;

[Route("api/v1/search")]
[ApiController]
public class SearchController : ControllerBase
{
    private readonly IMediator _mediator;

    public SearchController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET: api/v1/search/autocomplete
    /// Gợi ý tự động (Autocomplete) địa điểm & khách sạn theo phong cách Traveloka.
    /// </summary>
    [HttpGet("autocomplete")]
    public async Task<IActionResult> GetAutocomplete([FromQuery] SearchAutocompleteQuery query)
    {
        var data = await _mediator.Send(query);
        
        var response = new ApiResponse<List<SearchAutocompleteDto>>(true, "Gợi ý địa điểm thành công!", 200, data);
        return Ok(response);
    }

    /// <summary>
    /// GET: api/v1/search/hotels
    /// Tìm kiếm và lọc danh sách khách sạn khả dụng cho trang chủ.
    /// </summary>
    [HttpGet("hotels")]
    public async Task<IActionResult> SearchHotels([FromQuery] SearchHotelsQuery query)
    {
        var data = await _mediator.Send(query);
        
        var response = new ApiResponse<List<SearchHotelsDto>>(true, "Tìm kiếm khách sạn thành công!", 200, data);
        return Ok(response);
    }

    /// <summary>
    /// POST: api/v1/search/flights
    /// Tìm kiếm chuyến bay thời gian thực từ Duffel API đã được tinh gọn qua DTO.
    /// </summary>
    [HttpPost("flights")]
    public async Task<IActionResult> SearchFlights([FromBody] SearchFlightsQuery query)
    {
        var data = await _mediator.Send(query);
        
        var response = new ApiResponse<List<FlightOfferDto>>(
            true,
            "Tìm kiếm chuyến bay thành công!",
            200,
            data
        );
        return Ok(response);
    }

    /// <summary>
    /// GET: api/v1/search/airports
    /// Gợi ý tự động sân bay cho form tìm kiếm chuyến bay.
    /// </summary>
    [HttpGet("airports")]
    public async Task<IActionResult> GetAirports([FromQuery] GetAirportsQuery query)
    {
        var data = await _mediator.Send(query);
        
        var response = new ApiResponse<List<AirportDto>>(true, "Lấy danh sách sân bay thành công!", 200, data);
        return Ok(response);
    }
}
