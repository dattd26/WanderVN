using MediatR;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WanderVN.Application.Common;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Auth.Commands;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Unit>
{
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly JwtSettings _jwtSettings;

    public RegisterCommandHandler(IAuthRepository authRepository, IUnitOfWork unitOfWork, IEmailService emailService, IOptions<JwtSettings> jwtOptions)
    {
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _jwtSettings = jwtOptions.Value;
    }

    public async Task<Unit> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Chỉ cho phép tự đăng ký với 2 role công khai. Admin phải seed/tạo qua kênh khác.
        var allowedRoles = new[] { "Customer", "Partner" };
        if (!allowedRoles.Contains(request.Role))
            throw new ArgumentException($"Role '{request.Role}' không được phép tự đăng ký. Chỉ chấp nhận: Customer, Partner.");

        if (!await _authRepository.IsEmailUniqueAsync(request.Email))
            throw new ArgumentException("Email đã được sử dụng.");

        var role = await _authRepository.GetRoleByNameAsync(request.Role);
        if (role == null)
            throw new InvalidOperationException($"Role '{request.Role}' không tồn tại trong hệ thống. Vui lòng kiểm tra dữ liệu hoặc thêm role này vào database.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new Users
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            RoleId = role.Id,
            IsActive = false, // Yêu cầu xác nhận email trước khi đăng nhập
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Tạo JWT Token phục vụ mục đích xác nhận Email (hết hạn sau 24 giờ)
        var token = GenerateEmailVerificationToken(user.Email);
        var verificationLink = $"http://localhost:5173/verify-email?token={token}";

        // Gửi email xác nhận tự động dạng HTML chạy nền (Fire-and-Forget) để không chặn luồng HTTP Response của khách
        _ = Task.Run(async () =>
        {
            try
            {
                var emailSubject = "[WanderVN] Xác thực tài khoản của bạn";
                var emailBody = $@"
                    <p>Kính gửi quý khách <strong>{request.FullName}</strong>,</p>
                    <p>Chào mừng bạn đã chính thức tham gia vào cộng đồng lữ khách tinh hoa của <strong>WanderVN</strong>.</p>
                    <p>Để hoàn tất quá trình đăng ký và kích hoạt tài khoản của bạn, vui lòng nhấn vào nút bên dưới:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{verificationLink}' style='background-color: #735c00; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;'>Xác Nhận Email</a>
                    </div>
                    <p>Link xác nhận này sẽ hết hạn trong vòng 24 giờ.</p>
                    <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>";

                await _emailService.SendEmailAsync(request.Email, emailSubject, emailBody, isHtml: true);
            }
            catch (Exception)
            {
                // Bỏ qua lỗi gửi mail để tránh sập luồng chính đăng ký
            }
        }, cancellationToken);

        return Unit.Value;
    }

    private string GenerateEmailVerificationToken(string email)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim("purpose", "email_verification")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

