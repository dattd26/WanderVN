using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Users.Queries;
using WanderVN.Application.Features.Users.Queries.GetUserById;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using System.Threading;

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
    public async Task<IActionResult> GetCustomers([FromQuery] GetUsersQuery query, CancellationToken cancellationToken)
    {
        // Ghi đè RoleName để đảm bảo luôn lấy đúng Customer dù Client có truyền bậy
        query.RoleName = "Customer"; 
        
        var users = await _mediator.Send(query, cancellationToken);
        var response = new ApiResponse<PagedResult<UserDto>>(true, "Lấy danh sách khách hàng (Customer) thành công.", 200, users);
        
        return Ok(response);
    }

    /// GET api/v1/users/customers/{id}
    [HttpGet("customers/{id:int}")]
    public async Task<IActionResult> GetCustomerById(int id, CancellationToken cancellationToken)
    {
        var query = new GetUserByIdQuery(id, "Customer");
        var data = await _mediator.Send(query, cancellationToken);
        
        var response = new ApiResponse<UserDetailsDto>(true, "Lấy thông tin khách hàng thành công.", 200, data);
        return Ok(response);
    }

    /// GET api/v1/users/partners
    [HttpGet("partners")]
    public async Task<IActionResult> GetPartners([FromQuery] GetUsersQuery query, CancellationToken cancellationToken)
    {
        // Ghi đè RoleName để đảm bảo luôn lấy đúng Partner
        query.RoleName = "Partner";
        
        var users = await _mediator.Send(query, cancellationToken);
        var response = new ApiResponse<PagedResult<UserDto>>(true, "Lấy danh sách đối tác (Partner) thành công.", 200, users);
        
        return Ok(response);
    }

    /// GET api/v1/users/partners/{id}
    [HttpGet("partners/{id:int}")]
    public async Task<IActionResult> GetPartnerById(int id, CancellationToken cancellationToken)
    {
        var query = new GetUserByIdQuery(id, "Partner");
        var data = await _mediator.Send(query, cancellationToken);
        
        var response = new ApiResponse<UserDetailsDto>(true, "Lấy thông tin đối tác thành công.", 200, data);
        return Ok(response);
    }

    /// POST api/v1/users/customers
    [HttpPost("customers")]
    public async Task<IActionResult> CreateCustomer([FromBody] WanderVN.Application.Features.Users.Commands.CreateCustomer.CreateCustomerCommand command, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<UserDto>(true, "Tạo khách hàng thành công.", 201, data);
        return CreatedAtAction(nameof(GetCustomerById), new { id = data.Id }, response);
    }

    /// PUT api/v1/users/customers/{id}
    [HttpPut("customers/{id:int}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] WanderVN.Application.Features.Users.Commands.UpdateCustomer.UpdateCustomerCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;

        var data = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<UserDto>(true, "Cập nhật thông tin khách hàng thành công.", 200, data);
        return Ok(response);
    }
}