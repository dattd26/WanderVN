using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses; // Nhớ using cái này
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Auth.Commands;
using WanderVN.Application.Services;

namespace WanderVN.API.Controllers;

[Route("api/v1/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// POST: api/v1/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Email) || string.IsNullOrWhiteSpace(command.Password))
            throw new ArgumentException("Email và Password không được để trống.");

        var data = await _authService.LoginAsync(command);
        
        // Bọc kết quả vào ApiResponse<AuthResponse>
        var response = new ApiResponse<AuthResponse>(true, "Đăng nhập thành công!", 200, data);
        
        return Ok(response);
    }

    /// POST: api/v1/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Email) || string.IsNullOrWhiteSpace(command.Password) || string.IsNullOrWhiteSpace(command.FullName))
            throw new ArgumentException("Vui lòng điền đầy đủ thông tin.");

        await _authService.RegisterAsync(command);

        // Bọc kết quả vào ApiResponse<object> (Data = null vì đăng ký không cần trả về gì)
        var response = new ApiResponse<object>(true, "Đăng ký thành công!", 200, null);
        
        return Ok(response);
    }
}