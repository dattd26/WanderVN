using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Auth.Commands;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Unit>
{
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;

    public RegisterCommandHandler(IAuthRepository authRepository, IUnitOfWork unitOfWork, IEmailService emailService)
    {
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
        _emailService = emailService;
    }

    public async Task<Unit> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (!await _authRepository.IsEmailUniqueAsync(request.Email))
            throw new ArgumentException("Email đã được sử dụng.");

        var role = await _authRepository.GetRoleByNameAsync("Customer");
        if (role == null)
            throw new InvalidOperationException("Role 'Customer' không tồn tại trong hệ thống. Vui lòng kiểm tra dữ liệu hoặc thêm role này vào database.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new Users
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            RoleId = role.Id,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Gửi email xác nhận tự động dạng HTML chạy nền (Fire-and-Forget) để không chặn luồng HTTP Response của khách
        _ = Task.Run(async () =>
        {
            try
            {
                var emailSubject = "Chào mừng lữ khách đến với WanderVN - Hành trình di sản bắt đầu";
                var emailBody = $@"
                    <p>Kính gửi quý khách <strong>{request.FullName}</strong>,</p>
                    <p>Chào mừng bạn đã chính thức tham gia vào cộng đồng lữ khách tinh hoa của <strong>WanderVN</strong>.</p>
                    <p>Tài khoản du lịch di sản của bạn đã được thiết lập thành công với thông tin đăng ký như sau:</p>
                    <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                        <tr>
                            <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;'>Email đăng nhập:</td>
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>{request.Email}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Hành khách:</td>
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>{request.FullName}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Thời gian kích hoạt:</td>
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>{DateTimeOffset.UtcNow:dd/MM/yyyy HH:mm:ss} (UTC)</td>
                        </tr>
                    </table>
                    <p>Chúng tôi đã kích hoạt hồ sơ an toàn cho bạn. Giờ đây, bạn có thể bắt đầu khám phá và đặt trước các dịch vụ lưu trú di sản, đặt vé máy bay đặc quyền và chắp bút viết nên những trang du ký độc bản đầu tiên tại Việt Nam.</p>";

                await _emailService.SendEmailAsync(request.Email, emailSubject, emailBody, isHtml: true);
            }
            catch (Exception)
            {
                // Bỏ qua lỗi gửi mail để tránh sập luồng chính đăng ký
            }
        }, cancellationToken);

        return Unit.Value;
    }
}

