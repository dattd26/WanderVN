namespace WanderVN.Application.DTOs.Users;

public class UserRequestDto
{
    public int? RoleId { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool? IsActive { get; set; }
}
