using WanderVN.Application.DTOs.Locations;

namespace WanderVN.Application.DTOs.Tours;

public class TourResponseDto
{
    public int Id { get; set; }
    public int? LocationId { get; set; }
    public string Name { get; set; } = null!;
    public int? DurationDays { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public LocationResponseDto? Location { get; set; }
}
