using MediatR;
using System.Text.Json.Serialization;

namespace WanderVN.Application.Features.Auth.Commands;

public class ChangePasswordCommand : IRequest<bool>
{
    [JsonIgnore]
    public int UserId { get; set; }

    public string OldPassword { get; set; } = string.Empty;

    public string NewPassword { get; set; } = string.Empty;
}
