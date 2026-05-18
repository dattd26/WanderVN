namespace WanderVN.Application.DTOs.Locations;

public class LocationRequestDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}
