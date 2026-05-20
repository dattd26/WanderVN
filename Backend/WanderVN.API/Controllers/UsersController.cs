using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Users.Queries;
using WanderVN.Application.Features.Users.Queries.GetUserById;
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

    /// GET api/v1/users/customers
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers([FromQuery] GetUsersQuery query)
    {
        query.RoleName = "Customer";
        var users = await _mediator.Send(query);
        var response = new ApiResponse<PagedResult<UserDto>>(true, "Lấy danh sách khách hàng (Customer) thành công.", 200, users);
        return Ok(response);
    }

    /// GET api/v1/users/customers/{id}
    [HttpGet("customers/{id:int}")]
    public async Task<IActionResult> GetCustomerById(int id)
    {
        var data = await _mediator.Send(new GetUserByIdQuery(id, "Customer"));
        var response = new ApiResponse<UserDetailsDto>(true, "Lấy thông tin khách hàng thành công.", 200, data);
        return Ok(response);
    }

    /// GET api/v1/users/partners
    [HttpGet("partners")]
    public async Task<IActionResult> GetPartners([FromQuery] GetUsersQuery query)
    {
        query.RoleName = "Partner";
        var users = await _mediator.Send(query);
        var response = new ApiResponse<PagedResult<UserDto>>(true, "Lấy danh sách đối tác (Partner) thành công.", 200, users);
        return Ok(response);
    }

    /// GET api/v1/users/partners/{id}
    [HttpGet("partners/{id:int}")]
    public async Task<IActionResult> GetPartnerById(int id)
    {
        var data = await _mediator.Send(new GetUserByIdQuery(id, "Partner"));
        var response = new ApiResponse<UserDetailsDto>(true, "Lấy thông tin đối tác thành công.", 200, data);
        return Ok(response);
    }
}
