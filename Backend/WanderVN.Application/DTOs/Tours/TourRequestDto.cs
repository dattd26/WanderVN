namespace WanderVN.Application.DTOs.Tours;

public class TourRequestDto
{
    public int? LocationId { get; set; }
    public string Name { get; set; } = null!;
    public int? DurationDays { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
}
