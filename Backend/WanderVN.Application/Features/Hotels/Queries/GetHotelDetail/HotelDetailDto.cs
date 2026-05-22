using System.Collections.Generic;

namespace WanderVN.Application.Features.Hotels.Queries.GetHotelDetail;

public class HotelDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int? StarRating { get; set; }
    public string? Description { get; set; }
    public string? LocationName { get; set; }
    public List<string> Images { get; set; } = new List<string>();
    public List<RoomTypeInfo> RoomTypes { get; set; } = new List<RoomTypeInfo>();
}

public class RoomTypeInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int Capacity { get; set; }
    public int AvailableRooms { get; set; }
}
