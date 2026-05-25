using MediatR;
using System;

namespace WanderVN.Application.Features.Partner.Commands.ToggleRoomBlock;

public class ToggleRoomBlockCommand : IRequest<ToggleRoomBlockResponse>
{
    [System.Text.Json.Serialization.JsonIgnore]
    public int RoomTypeId { get; set; }

    public string BlockDate { get; set; } = string.Empty;

    public string Action { get; set; } = "BLOCK"; // "BLOCK" hoặc "UNBLOCK"
}

public class ToggleRoomBlockResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
