using System;
using System.Collections.Generic;

namespace WanderVN.Application.Features.Users.Queries.GetUserById;

public class UserDetailsDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool? IsActive { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public string? RoleName { get; set; }
    public List<UserHotelDto>? Hotels { get; set; }
}

public class UserHotelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public int? StarRating { get; set; }
}
