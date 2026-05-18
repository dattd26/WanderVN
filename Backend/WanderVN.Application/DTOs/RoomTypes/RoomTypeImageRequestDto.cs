namespace WanderVN.Application.DTOs.RoomTypes;

public class RoomTypeImageRequestDto
{
    public int? RoomTypeId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool? IsPrimary { get; set; }
}
