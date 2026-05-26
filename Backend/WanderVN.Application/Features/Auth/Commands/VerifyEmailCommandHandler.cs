using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WanderVN.Application.Common;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Auth.Commands;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Unit>
{
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly JwtSettings _jwtSettings;
    private readonly IEmailService _emailService;

    public VerifyEmailCommandHandler(IAuthRepository authRepository, IUnitOfWork unitOfWork, IOptions<JwtSettings> jwtOptions, IEmailService emailService)
    {
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
        _jwtSettings = jwtOptions.Value;
        _emailService = emailService;
    }

    public async Task<Unit> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            throw new ArgumentException("Token không hợp lệ.");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.Secret);

        try
        {
            tokenHandler.ValidateToken(request.Token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;

            // Kiểm tra purpose của token
            var purposeClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "purpose")?.Value;
            if (purposeClaim != "email_verification")
            {
                throw new SecurityTokenException("Token không đúng mục đích sử dụng.");
            }

            // Lấy email từ token
            var email = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                throw new SecurityTokenException("Không tìm thấy thông tin email trong token.");
            }

            var user = await _authRepository.GetUserByEmailAsync(email);
            if (user == null)
            {
                throw new ArgumentException("Người dùng không tồn tại.");
            }

            if (user.IsActive == true)
            {
                // Nếu tài khoản đã được kích hoạt trước đó, có thể bỏ qua hoặc ném lỗi nhẹ
                return Unit.Value;
            }

            // Kích hoạt tài khoản
            user.IsActive = true;
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Gửi email thông báo trạng thái kích hoạt thành công (chạy nền)
            _ = Task.Run(async () =>
            {
                try
                {
                    var emailSubject = "[WanderVN] Tài khoản của bạn đã được kích hoạt";
                    var emailBody = $@"
                        <p>Kính gửi quý khách <strong>{user.FullName}</strong>,</p>
                        <p>Chúc mừng! Tài khoản của bạn tại <strong>WanderVN</strong> đã được xác thực và kích hoạt thành công.</p>
                        <p>Bây giờ bạn có thể đăng nhập vào hệ thống để bắt đầu trải nghiệm các dịch vụ của chúng tôi.</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='http://localhost:5173/login' style='background-color: #735c00; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;'>Đăng Nhập Ngay</a>
                        </div>
                        <p>Trân trọng,</p>
                        <p>Đội ngũ WanderVN.</p>";

                    await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody, isHtml: true);
                }
                catch (Exception)
                {
                    // Bỏ qua lỗi gửi mail để tránh ảnh hưởng đến luồng chính
                }
            }, cancellationToken);

            return Unit.Value;
        }
        catch (SecurityTokenExpiredException)
        {
            throw new ArgumentException("Link xác nhận đã hết hạn. Vui lòng đăng ký lại hoặc yêu cầu gửi lại email xác nhận.");
        }
        catch (Exception)
        {
            throw new ArgumentException("Token xác nhận không hợp lệ hoặc đã bị lỗi.");
        }
    }
}