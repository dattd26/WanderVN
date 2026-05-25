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
                var isPartner = request.Role == "Partner";
                var emailSubject = isPartner
                    ? "Chào mừng đối tác mới đến với WanderVN Partner Portal"
                    : "Chào mừng lữ khách đến với WanderVN - Hành trình di sản bắt đầu";

                var welcomeIntro = isPartner
                    ? "Chào mừng bạn đã chính thức trở thành đối tác của <strong>WanderVN Partner Portal</strong>. Hãy hoàn tất hồ sơ cơ sở lưu trú để được duyệt và đón những lữ khách đầu tiên."
                    : "Chào mừng bạn đã chính thức tham gia vào cộng đồng lữ khách tinh hoa của <strong>WanderVN</strong>.";

                var emailBody = $@"
                    <p>Kính gửi quý khách <strong>{request.FullName}</strong>,</p>
                    <p>{welcomeIntro}</p>
                    <p>Tài khoản của bạn đã được thiết lập thành công với thông tin đăng ký như sau:</p>
                    <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                        <tr>
                            <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;'>Email đăng nhập:</td>
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>{request.Email}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Họ tên:</td>
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>{request.FullName}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Vai trò:</td>
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>{(isPartner ? "Đối tác cơ sở lưu trú" : "Khách lữ hành")}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Thời gian kích hoạt:</td>
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>{DateTimeOffset.UtcNow:dd/MM/yyyy HH:mm:ss} (UTC)</td>
                        </tr>
                    </table>";

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

