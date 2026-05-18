namespace WanderVN.Application.DTOs.Wishlists;

public class WishlistRequestDto
{
    public int? UserId { get; set; }
    public int? ServiceId { get; set; }
    public string? ServiceType { get; set; }
}
