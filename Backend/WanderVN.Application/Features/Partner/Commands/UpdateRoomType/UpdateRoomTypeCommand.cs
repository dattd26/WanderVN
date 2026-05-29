using MediatR;
using WanderVN.Application.DTOs.Request;

namespace WanderVN.Application.Features.Partner.Commands.UpdateRoomType;

// Command định nghĩa yêu cầu chỉnh sửa và điều chỉnh số lượng phòng của hạng phòng di sản
public class UpdateRoomTypeCommand : IRequest<UpdateRoomTypeResponse>
{
    [System.Text.Json.Serialization.JsonIgnore]
    public int RoomTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int Capacity { get; set; }
    public int TotalRooms { get; set; }

    public string? Description { get; set; }

    public List<RatePlanDto> RatePlans { get; set; } = new List<RatePlanDto>();
}

public class UpdateRoomTypeResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = "Updated";
}
