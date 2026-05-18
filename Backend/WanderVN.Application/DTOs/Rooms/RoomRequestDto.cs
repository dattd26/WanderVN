namespace WanderVN.Application.DTOs.Rooms;

public class RoomRequestDto
{
    public int? RoomTypeId { get; set; }
    public string RoomNumber { get; set; } = null!;
    public string? Status { get; set; }
}
