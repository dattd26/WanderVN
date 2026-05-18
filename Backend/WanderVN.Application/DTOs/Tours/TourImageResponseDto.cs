namespace WanderVN.Application.DTOs.Tours;

public class TourImageResponseDto
{
    public int Id { get; set; }
    public int? TourId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool? IsPrimary { get; set; }
}
