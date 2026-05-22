using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Flights.Queries.GetFlightOfferDetail;
using WanderVN.Application.Features.Flights.Queries.SearchFlights;
using WanderVN.Application.Features.Hotels.Queries.SearchHotels;
using WanderVN.Application.Features.Hotels.Queries.SearchAutocomplete;

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
        
        var response = new ApiResponse<List<WanderVN.Application.DTOs.Response.FlightOfferDto>>(
            true, 
            "Tìm kiếm chuyến bay thành công!", 
            200, 
            data
        );
        return Ok(response);
    }

    /// <summary>
    /// GET: api/v1/search/validate-offer/{offerId}
    /// Lấy chi tiết offer và xác thực trạng thái với Duffel API.
    /// </summary>
    [HttpGet("validate-offer/{offerId}")]
    public async Task<IActionResult> ValidateOffer([FromRoute] string offerId)
    {
        try
        {
            var query = new GetFlightOfferDetailQuery { OfferId = offerId };
            var data = await _mediator.Send(query);
            var response = new ApiResponse<FlightOfferDetailDto>(true, "Xác thực offer thành công", 200, data);
            return Ok(response);
        }
        catch (HttpRequestException ex)
        {
            var response = new ApiResponse<FlightOfferDetailDto>(false, ex.Message, 404, default);
            return NotFound(response);
        }
        catch (Exception ex)
        {
            var response = new ApiResponse<FlightOfferDetailDto>(false, ex.Message, 400, default);
            return BadRequest(response);
        }
    }
}
