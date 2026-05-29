using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses; // Nhớ using cái này
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Auth.Commands;
using WanderVN.Application.Features.Auth.Queries;

namespace WanderVN.API.Controllers;

[Route("api/v1/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// POST: api/v1/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginQuery query)
    {
        if (string.IsNullOrWhiteSpace(query.Email) || string.IsNullOrWhiteSpace(query.Password))
            throw new ArgumentException("Email và Password không được để trống.");

        var data = await _mediator.Send(query);
        var response = new ApiResponse<AuthResponse>(true, "Đăng nhập thành công!", 200, data);
        return Ok(response);
    }

    /// POST: api/v1/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Email) || string.IsNullOrWhiteSpace(command.Password) || string.IsNullOrWhiteSpace(command.FullName))
            throw new ArgumentException("Vui lòng điền đầy đủ thông tin.");

        await _mediator.Send(command);
        var response = new ApiResponse<object>(true, "Đăng ký thành công!", 200, null);
        return Ok(response);
    }

    /// PUT: api/v1/auth/change-password
    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.OldPassword) || string.IsNullOrWhiteSpace(command.NewPassword))
            throw new ArgumentException("Vui lòng điền đầy đủ mật khẩu cũ và mới.");

        var userIdClaim = User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new ApiResponse<object>(false, "Không thể xác định người dùng.", 401, null));
        }

        command.UserId = userId;
        await _mediator.Send(command);

        var response = new ApiResponse<bool>(true, "Cập nhật mật khẩu thành công!", 200, true);
        return Ok(response);
    }
}