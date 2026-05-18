namespace WanderVN.Application.DTOs.RoomTypes;

public class RoomTypeImageResponseDto
{
    public int Id { get; set; }
    public int? RoomTypeId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool? IsPrimary { get; set; }
}
