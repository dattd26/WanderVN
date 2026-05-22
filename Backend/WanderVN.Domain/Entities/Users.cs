using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Users
{
    public int Id { get; set; }

    public int? RoleId { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? FullName { get; set; }

    public string? PhoneNumber { get; set; }

    public string? AvatarUrl { get; set; }

    public bool? IsActive { get; set; }

    public DateTimeOffset? CreatedAt { get; set; }

    public DateTimeOffset? UpdatedAt { get; set; }

    public virtual ICollection<Bookings> Bookings { get; set; } = new List<Bookings>();

    public virtual ICollection<ChatLogs> ChatLogs { get; set; } = new List<ChatLogs>();

    public virtual Roles? Role { get; set; }

    public virtual ICollection<Wishlists> Wishlists { get; set; } = new List<Wishlists>();

    public virtual ICollection<Hotels> Hotels { get; set; } = new List<Hotels>(); // Danh sách khách sạn do người dùng này sở hữu (Partner)
}
