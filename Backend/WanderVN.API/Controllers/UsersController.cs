using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Users.Queries;
using WanderVN.Application.Features.Users.Queries.GetUsers;

namespace WanderVN.API.Controllers;

[Route("api/v1/users")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetUsersQuery query)
    {
        var users = await _mediator.Send(query);
        var response = new ApiResponse<PagedResult<UserDto>>(true, "Lấy toàn bộ danh sách người dùng thành công.", 200, users);
        return Ok(response);
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers([FromQuery] GetUsersQuery query)
    {
        query.RoleName = "Customer"; 
        var users = await _mediator.Send(query);
        var response = new ApiResponse<PagedResult<UserDto>>(true, "Lấy danh sách khách hàng (Customer) thành công.", 200, users);
        return Ok(response);
    }

    [HttpGet("partners")]
    public async Task<IActionResult> GetPartners([FromQuery] GetUsersQuery query)
    {
        query.RoleName = "Partner"; 
        var users = await _mediator.Send(query);
        var response = new ApiResponse<PagedResult<UserDto>>(true, "Lấy danh sách đối tác (Partner) thành công.", 200, users);
        return Ok(response);
    }
}
