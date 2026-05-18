using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.DTOs;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork; 
        private readonly IJwtService _jwtService;
        private readonly IPasswordService _passwordService;

        public AuthController(IUnitOfWork unitOfWork, IJwtService jwtService, IPasswordService passwordService)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _passwordService = passwordService;
        }

       
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
          
            var existingUser = await _unitOfWork.Users.FindFirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { Message = "Email này đã tồn tại trong hệ thống WanderVN!" });
            }

            var newUser = new Users
            {
                Email = request.Email,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = _passwordService.HashPassword(request.Password),
                RoleId = 2, 
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            
            await _unitOfWork.Users.AddAsync(newUser);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new ApiResponse<object>(
                      success: true,
                      message: "Đăng ký tài khoản WanderVN thành công!",
                      statusCode: 200,
                      data: null
             ));
        }

        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            
            var user = await _unitOfWork.Users.FindFirstOrDefaultAsync(u => u.Email == request.Email);

           
            if (user == null || !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Địa chỉ email hoặc mật khẩu không chính xác." });
            }

           
            if (user.IsActive == false)
            {
                return BadRequest(new { Message = "Tài khoản của anh hiện đang bị khóa." });
            }

           
            var accessToken = _jwtService.GenerateAccessToken(user);

            
            string roleName = user.RoleId == 1 ? "Admin" : (user.RoleId == 3 ? "Vendor" : "Customer");

            var responseData = new
            {
                AccessToken = accessToken,
                User = new { user.Id, user.FullName, user.Email, Role = roleName }
            };

            return Ok(new ApiResponse<object>(
                success: true,
                message: "Đăng nhập thành công!",
                statusCode: 200,
                data: responseData
            ));
        }
    }
}