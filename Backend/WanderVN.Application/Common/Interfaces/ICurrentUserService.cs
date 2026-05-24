namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Trừu tượng truy cập thông tin user hiện tại từ JWT claims, tách Application layer
/// khỏi sự phụ thuộc <c>IHttpContextAccessor</c> của tầng API. Handler chỉ cần
/// inject <see cref="ICurrentUserService"/> để biết ai đang gọi request.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>ID người dùng đọc từ claim "id". <c>null</c> nếu request chưa xác thực.</summary>
    int? UserId { get; }

    /// <summary>Email người dùng (ClaimTypes.Email). <c>null</c> nếu chưa đăng nhập.</summary>
    string? Email { get; }

    /// <summary>Role người dùng (ClaimTypes.Role). <c>null</c> nếu chưa đăng nhập.</summary>
    string? Role { get; }

    /// <summary>True nếu user đã xác thực và mang role chỉ định.</summary>
    bool IsInRole(string role);
}
