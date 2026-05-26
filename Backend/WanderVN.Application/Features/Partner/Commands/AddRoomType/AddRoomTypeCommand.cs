using MediatR;
using WanderVN.Application.DTOs.Request;

namespace WanderVN.Application.Features.Partner.Commands.AddRoomType;

public class AddRoomTypeCommand : IRequest<AddRoomTypeResponse>
{
    [System.Text.Json.Serialization.JsonIgnore]
    public int HotelId { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public int Capacity { get; set; }

    public int TotalRooms { get; set; }
    public string? Description { get; set; }
    public List<RatePlanDto> RatePlans { get; set; } = new List<RatePlanDto>();
}

public class AddRoomTypeResponse
{
    public int RoomTypeId { get; set; }
    public string Status { get; set; } = "Created";
}
