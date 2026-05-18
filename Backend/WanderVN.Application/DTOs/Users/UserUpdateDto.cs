namespace WanderVN.Application.DTOs.Users;

public class UserUpdateDto
{
    public int? RoleId { get; set; }
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool? IsActive { get; set; }
}
