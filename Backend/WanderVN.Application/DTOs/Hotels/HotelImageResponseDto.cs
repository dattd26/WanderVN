namespace WanderVN.Application.DTOs.Hotels;

public class HotelImageResponseDto
{
    public int Id { get; set; }
    public int? HotelId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool? IsPrimary { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
}
