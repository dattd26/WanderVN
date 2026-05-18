namespace WanderVN.Application.DTOs.Hotels;

public class HotelRequestDto
{
    public int? LocationId { get; set; }
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public int? StarRating { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}
