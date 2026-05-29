using WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelsForReview;

namespace WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelReviewDetail;

public class AdminHotelRoomTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int Capacity { get; set; }
    public int TotalRooms { get; set; }
    public string? Description { get; set; }
}

public class AdminHotelDetailDto : AdminHotelListItemDto
{
    public string? Description { get; set; }
    public string? CancellationPolicy { get; set; }
    public string? OwnerPhone { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public List<AdminHotelRoomTypeDto> RoomTypes { get; set; } = new();
}
