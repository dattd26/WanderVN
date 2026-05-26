using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Geocoding.Queries.GeocodeLocation;

namespace WanderVN.API.Controllers;

/// <summary>
/// Controller cung cấp endpoint geocoding (chuyển tên địa danh thành tọa độ) cho Frontend
/// để hiển thị bản đồ OpenStreetMap. Kết quả được cache trong DB.
/// </summary>
[Route("api/v1/geocoding")]
[ApiController]
public class GeocodingController : ControllerBase
{
    private readonly IMediator _mediator;

    public GeocodingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET: api/v1/geocoding/location/{id}
    /// Trả về tọa độ lat/lng của một Location — dùng để center map ở trang kết quả tìm kiếm khách sạn.
    /// </summary>
    [HttpGet("location/{id:int}")]
    public async Task<IActionResult> GeocodeLocation(int id)
    {
        var data = await _mediator.Send(new GeocodeLocationQuery(id));

        if (data == null)
        {
            return NotFound(new ApiResponse<GeocodeLocationDto?>(
                false,
                "Không tìm thấy tọa độ cho địa điểm này.",
                404,
                null
            ));
        }

        var response = new ApiResponse<GeocodeLocationDto>(
            true,
            "Lấy tọa độ địa điểm thành công!",
            200,
            data
        );
        return Ok(response);
    }
}
