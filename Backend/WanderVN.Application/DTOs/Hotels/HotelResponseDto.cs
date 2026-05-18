using WanderVN.Application.DTOs.Amenities;
using WanderVN.Application.DTOs.Locations;

namespace WanderVN.Application.DTOs.Hotels;

public class HotelResponseDto
{
    public int Id { get; set; }
    public int? LocationId { get; set; }
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public int? StarRating { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public LocationResponseDto? Location { get; set; }
    public ICollection<HotelImageResponseDto> HotelImages { get; set; } = new List<HotelImageResponseDto>();
    public ICollection<AmenityResponseDto> Amenities { get; set; } = new List<AmenityResponseDto>();
}
