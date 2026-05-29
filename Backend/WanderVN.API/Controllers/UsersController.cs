using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Users.Queries;
using WanderVN.Application.Features.Users.Queries.GetUserById;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using WanderVN.Application.Features.Users.Commands.CreateCustomer;
using WanderVN.Application.Features.Users.Commands.DeleteCustomer;
using WanderVN.Application.Features.Users.Commands.UpdateCustomer;
using WanderVN.Application.Features.Users.Commands.ChangePartnerPassword;
using WanderVN.Application.Features.Users.Commands.ApprovePartner;
using WanderVN.Application.Features.Users.Commands.RejectPartner;
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
    [HttpDelete("customers/{id}")]
    public async Task<IActionResult> DeleteCustomer(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteCustomerCommand(id), cancellationToken);
        
        var response = new ApiResponse<bool>(true, "Xóa khách hàng thành công.", 200, result);
        
        return Ok(response);
    }
    /// GET api/v1/users/partners
    [HttpGet("partners")]
    public async Task<IActionResult> GetPartners([FromQuery] GetUsersQuery query, CancellationToken cancellationToken)
    {

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

    /// PUT api/v1/users/partners/{id}/password
    [HttpPut("partners/{id:int}/password")]
    public async Task<IActionResult> ChangePartnerPassword(int id, [FromBody] ChangePartnerPasswordCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<bool>(true, "Đổi mật khẩu đối tác thành công.", 200, result);
        return Ok(response);
    }

    /// POST api/v1/users/partners/{id}/approve
    [HttpPost("partners/{id:int}/approve")]
    public async Task<IActionResult> ApprovePartner(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ApprovePartnerCommand { Id = id }, cancellationToken);
        var response = new ApiResponse<bool>(true, "Duyệt hồ sơ đối tác thành công.", 200, result);
        return Ok(response);
    }

    /// POST api/v1/users/partners/{id}/reject   body: { "rejectReason": "..." }
    [HttpPost("partners/{id:int}/reject")]
    public async Task<IActionResult> RejectPartner(int id, [FromBody] RejectPartnerCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<bool>(true, "Từ chối hồ sơ đối tác thành công.", 200, result);
        return Ok(response);
    }

    /// POST api/v1/users/customers
    [HttpPost("customers")]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerCommand command, CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<UserDto>(true, "Tạo khách hàng thành công.", 201, data);
        return CreatedAtAction(nameof(GetCustomerById), new { id = data.Id }, response);
    }

    /// PUT api/v1/users/customers/{id}
    [HttpPut("customers/{id:int}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;

        var data = await _mediator.Send(command, cancellationToken);
        var response = new ApiResponse<UserDto>(true, "Cập nhật thông tin khách hàng thành công.", 200, data);
        return Ok(response);
    }
}