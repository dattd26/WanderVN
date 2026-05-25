using MediatR;
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
        var response = new ApiResponse<object>(true, "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.", 200, null);
        return Ok(response);
    }

    /// POST: api/v1/auth/verify-email
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command)
    {
        await _mediator.Send(command);
        var response = new ApiResponse<object>(true, "Xác nhận email và kích hoạt tài khoản thành công!", 200, null);
        return Ok(response);
    }
}