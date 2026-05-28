namespace WanderVN.Application.Features.Users.Queries.GetUsers;

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public string? RoleName { get; set; }
    public bool? IsActive { get; set; }

    // Trạng thái xét duyệt hồ sơ: 0=Pending, 1=Active, 2=Rejected (chủ yếu dùng cho Partner).
    public int Status { get; set; }
    public string? RejectReason { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }

    public DateTimeOffset? CreatedAt { get; set; }

    // Thêm trường doanh thu
    public decimal TotalRevenue { get; set; }
}
