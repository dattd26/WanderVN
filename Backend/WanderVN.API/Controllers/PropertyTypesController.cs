using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.PropertyTypes.Queries.GetPropertyTypes;

namespace WanderVN.API.Controllers;

/// <summary>
/// Controller xử lý danh mục Loại hình lưu trú (Khách sạn, Villa, Homestay, Resort...).
/// </summary>
[Route("api/v1/property-types")]
[ApiController]
public class PropertyTypesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PropertyTypesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET: api/v1/property-types
    /// Lấy danh sách toàn bộ các loại hình lưu trú hiện có trong hệ thống để Frontend hiển thị lên bộ lọc Sidebar.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPropertyTypes()
    {
        var data = await _mediator.Send(new GetPropertyTypesQuery());

        var response = new ApiResponse<List<GetPropertyTypesDto>>(
            true,
            "Lấy danh sách loại hình lưu trú thành công!",
            200,
            data
        );
        return Ok(response);
    }
}
