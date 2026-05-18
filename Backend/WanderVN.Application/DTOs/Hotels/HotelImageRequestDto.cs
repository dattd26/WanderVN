namespace WanderVN.Application.DTOs.Hotels;

public class HotelImageRequestDto
{
    public int? HotelId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool? IsPrimary { get; set; }
}
