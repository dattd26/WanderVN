using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Home.Queries.GetHomeData;

namespace WanderVN.API.Controllers;

[Route("api/v1/home")]
[ApiController]
public class HomeController : ControllerBase
{
    private readonly IMediator _mediator;

    public HomeController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET: api/v1/home/moods
    /// Lấy danh sách cảm hứng du lịch (Travel Moods) cho trang chủ.
    /// </summary>
    [HttpGet("moods")]
    public async Task<IActionResult> GetTravelMoods()
    {
        var data = await _mediator.Send(new GetHomeTravelMoodsQuery());
        var response = new ApiResponse<List<HomeTravelMoodDto>>(true, "Lấy danh sách cảm hứng thành công!", 200, data);
        return Ok(response);
    }

    /// <summary>
    /// GET: api/v1/home/editorial-destinations
    /// Lấy danh sách điểm đến nổi bật phong cách tạp chí (Editorial Destinations).
    /// </summary>
    [HttpGet("editorial-destinations")]
    public async Task<IActionResult> GetEditorialDestinations()
    {
        var data = await _mediator.Send(new GetHomeEditorialDestinationsQuery());
        var response = new ApiResponse<List<HomeEditorialDestinationDto>>(true, "Lấy danh sách điểm đến nổi bật thành công!", 200, data);
        return Ok(response);
    }

    /// <summary>
    /// GET: api/v1/home/weekend-escapes
    /// Lấy danh sách điểm trốn cuối tuần theo điểm khởi hành (Origin: hanoi, danang, hcm).
    /// </summary>
    [HttpGet("weekend-escapes")]
    public async Task<IActionResult> GetWeekendEscapes([FromQuery] string origin = "hanoi")
    {
        var data = await _mediator.Send(new GetHomeWeekendEscapesQuery(origin));
        var response = new ApiResponse<List<HomeWeekendEscapeDto>>(true, "Lấy danh sách điểm trốn cuối tuần thành công!", 200, data);
        return Ok(response);
    }

    /// <summary>
    /// GET: api/v1/home/stay-collections
    /// Lấy danh sách các bộ sưu tập phòng nghỉ (Stay Collections).
    /// </summary>
    [HttpGet("stay-collections")]
    public async Task<IActionResult> GetStayCollections()
    {
        var data = await _mediator.Send(new GetHomeStayCollectionsQuery());
        var response = new ApiResponse<List<HomeStayCollectionDto>>(true, "Lấy danh sách bộ sưu tập thành công!", 200, data);
        return Ok(response);
    }

    /// <summary>
    /// GET: api/v1/home/moods/{id}
    /// Lấy chi tiết cảm hứng du lịch kèm danh sách khách sạn được tuyển chọn.
    /// </summary>
    [HttpGet("moods/{id}")]
    public async Task<IActionResult> GetTravelMoodById(string id)
    {
        var data = await _mediator.Send(new WanderVN.Application.Features.Home.Queries.GetTravelMoodById.GetTravelMoodByIdQuery(id));
        if (data == null)
        {
            return NotFound(new ApiResponse<object>(false, "Không tìm thấy cảm hứng du lịch này.", 404, null));
        }
        var response = new ApiResponse<WanderVN.Application.Features.Home.Queries.GetTravelMoodById.TravelMoodDetailDto>(true, "Lấy chi tiết cảm hứng thành công!", 200, data);
        return Ok(response);
    }
}
