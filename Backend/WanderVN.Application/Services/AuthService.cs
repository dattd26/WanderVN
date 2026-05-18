using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Auth.Commands;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories; 

namespace WanderVN.Application.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork; 
    private const string SecretKey = "SecretKey_WanderVN_DaiHon32KyTu!";

    // Constructor đã được thêm IUnitOfWork
    public AuthService(IAuthRepository authRepository, IUnitOfWork unitOfWork)
    {
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResponse> LoginAsync(LoginCommand command)
    {
        var user = await _authRepository.GetUserByEmailAsync(command.Email);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(command.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng."); 

        if (user.IsActive == false)
            throw new UnauthorizedAccessException("Tài khoản đã bị khóa.");

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            Token = token,
            Role  = user.Role?.Name ?? "Customer"
        };
    }

    public async Task RegisterAsync(RegisterCommand command)
    {
        if (!await _authRepository.IsEmailUniqueAsync(command.Email))
            throw new ArgumentException("Email đã được sử dụng."); 

        var role = await _authRepository.GetRoleByNameAsync("Customer");
        if (role == null)
            throw new InvalidOperationException("Role 'Customer' không tồn tại trong hệ thống. Vui lòng kiểm tra dữ liệu hoặc thêm role này vào database.");
        
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(command.Password);

        var user = new Users
        {
            Email        = command.Email,
            PasswordHash = passwordHash,
            FullName     = command.FullName,
            PhoneNumber  = command.PhoneNumber,
            RoleId       = role.Id,
            IsActive     = true,
            CreatedAt    = DateTimeOffset.UtcNow
        };

        
        await _authRepository.AddAsync(user);

      
        await _unitOfWork.SaveChangesAsync(); 
    }

    private string GenerateJwtToken(Users user)
    {
        var claims = new[]
        {
            new Claim("id",             user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role,  user.Role?.Name ?? "User")
        };

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims:             claims,
            expires:            DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}