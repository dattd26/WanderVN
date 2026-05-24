using MediatR;

namespace WanderVN.Application.Features.Auth.Commands;

public class RegisterCommand : IRequest<Unit>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Role được phép đăng ký công khai: "Customer" (mặc định, khách lữ hành)
    /// hoặc "Partner" (chủ cơ sở lưu trú). "Admin" KHÔNG được phép tự đăng ký
    /// — Handler sẽ reject nếu nhận giá trị khác.
    /// </summary>
    public string Role { get; set; } = "Customer";
}
