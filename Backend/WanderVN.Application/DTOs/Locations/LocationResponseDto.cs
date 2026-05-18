namespace WanderVN.Application.DTOs.Locations;

public class LocationResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}
