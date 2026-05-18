namespace WanderVN.Application.DTOs.Wishlists;

public class WishlistResponseDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int? ServiceId { get; set; }
    public string? ServiceType { get; set; }
}
