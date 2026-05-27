using MediatR;
using System.Text.Json.Serialization;

namespace WanderVN.Application.Features.Users.Commands.ChangePartnerPassword;

public class ChangePartnerPasswordCommand : IRequest<bool>
{
    [JsonIgnore]
    public int Id { get; set; }

    public string NewPassword { get; set; } = string.Empty;
}
