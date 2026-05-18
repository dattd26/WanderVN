namespace WanderVN.Application.DTOs.Tours;

public class TourImageRequestDto
{
    public int? TourId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool? IsPrimary { get; set; }
}
