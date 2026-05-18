namespace WanderVN.Application.DTOs.RoomTypes;

public class RoomTypeRequestDto
{
    public int? HotelId { get; set; }
    public string Name { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public int Capacity { get; set; }
    public int TotalRooms { get; set; }
}
