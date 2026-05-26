using MediatR;
using System.Collections.Generic;
using WanderVN.Application.DTOs.Request;

namespace WanderVN.Application.Features.Partner.Commands.UpdateRatePlans;

public class UpdateRatePlansCommand : IRequest<UpdateRatePlansResponse>
{
    [System.Text.Json.Serialization.JsonIgnore]
    public int HotelId { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public int RoomTypeId { get; set; }

    public List<RatePlanDto> RatePlans { get; set; } = new List<RatePlanDto>();
}

public class UpdateRatePlansResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
