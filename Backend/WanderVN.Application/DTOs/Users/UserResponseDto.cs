using WanderVN.Application.DTOs.Roles;

namespace WanderVN.Application.DTOs.Users;

public class UserResponseDto
{
    public int Id { get; set; }
    public int? RoleId { get; set; }
    public string Email { get; set; } = null!;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool? IsActive { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public RoleResponseDto? Role { get; set; }
}
