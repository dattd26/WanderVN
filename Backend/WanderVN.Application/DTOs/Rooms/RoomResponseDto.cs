namespace WanderVN.Application.DTOs.Rooms;

public class RoomResponseDto
{
    public int Id { get; set; }
    public int? RoomTypeId { get; set; }
    public string RoomNumber { get; set; } = null!;
    public string? Status { get; set; }
}
