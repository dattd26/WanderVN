using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediatR;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WanderVN.Application.Common;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Enums;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Auth.Queries;

public class LoginQueryHandler : IRequestHandler<LoginQuery, AuthResponse>
{
    private readonly IAuthRepository _authRepository;
    private readonly JwtSettings _jwtSettings;

    public LoginQueryHandler(IAuthRepository authRepository, IOptions<JwtSettings> jwtOptions)
    {
        _authRepository = authRepository;
        _jwtSettings = jwtOptions.Value;
    }

    public async Task<AuthResponse> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var user = await _authRepository.GetUserByEmailAsync(request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        // Chặn theo trạng thái xét duyệt hồ sơ (Status) trước, sau đó mới tới cờ khóa (IsActive).
        if (user.Status == (int)UserStatus.Pending)
            throw new UnauthorizedAccessException("Tài khoản của bạn đang chờ phê duyệt.");

        if (user.Status == (int)UserStatus.Rejected)
            throw new UnauthorizedAccessException("Hồ sơ đăng ký của bạn đã bị từ chối.");

        if (user.IsActive == false)
            throw new UnauthorizedAccessException("Tài khoản chưa được kích hoạt hoặc đã bị khóa. Vui lòng kiểm tra email để xác thực.");

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            UserId = user.Id,
            Token = token,
            Role = user.Role?.Name ?? "Customer"
        };
    }

    private string GenerateJwtToken(Domain.Entities.Users user)
    {
        var claims = new[]
        {
            new Claim("id", user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
