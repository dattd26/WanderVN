namespace WanderVN.Application.DTOs.RoomTypes;

public class RoomTypeResponseDto
{
    public int Id { get; set; }
    public int? HotelId { get; set; }
    public string Name { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public int Capacity { get; set; }
    public int TotalRooms { get; set; }
    public ICollection<RoomTypeImageResponseDto> RoomTypeImages { get; set; } = new List<RoomTypeImageResponseDto>();
}
