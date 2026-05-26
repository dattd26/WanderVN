using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediatR;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WanderVN.Application.Common;
using WanderVN.Application.DTOs.Response;
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

        if (user.IsActive == false)
        {
            if (user.Role?.Name == "Partner")
                throw new UnauthorizedAccessException("Tài khoản của bạn đang chờ phê duyệt.");
            else
                throw new UnauthorizedAccessException("Tài khoản đã bị khóa.");
        }

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
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
