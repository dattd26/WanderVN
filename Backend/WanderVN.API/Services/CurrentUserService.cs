using System.Security.Claims;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.API.Services;

/// <summary>
/// Triển khai <see cref="ICurrentUserService"/> đọc claims từ <c>HttpContext.User</c>
/// (đã được JWT Bearer middleware xác thực).
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserService(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public int? UserId
    {
        get
        {
            var raw = _accessor.HttpContext?.User?.FindFirst("id")?.Value;
            return int.TryParse(raw, out var id) ? id : null;
        }
    }

    public string? Email => _accessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;

    public string? Role => _accessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

    public bool IsInRole(string role) =>
        _accessor.HttpContext?.User?.IsInRole(role) ?? false;
}
