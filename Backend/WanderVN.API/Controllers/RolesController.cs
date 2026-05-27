using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Features.Roles.Queries.GetRoles;

namespace WanderVN.API.Controllers;

/// <summary>
/// Controller cung cấp danh mục Vai trò (Roles) cho Frontend để render dropdown động,
/// tránh hard-code RoleId trong source code.
/// </summary>
[Route("api/v1/roles")]
[ApiController]
public class RolesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RolesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET: api/v1/roles
    /// Lấy toàn bộ danh sách vai trò trong hệ thống (Customer, Partner, Admin, Guest...).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        var data = await _mediator.Send(new GetRolesQuery());

        var response = new ApiResponse<List<GetRolesDto>>(
            true,
            "Lấy danh sách vai trò thành công!",
            200,
            data
        );
        return Ok(response);
    }
}
