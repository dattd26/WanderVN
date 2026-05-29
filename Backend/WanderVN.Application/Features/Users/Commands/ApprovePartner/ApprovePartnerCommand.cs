using MediatR;
using System.Text.Json.Serialization;

namespace WanderVN.Application.Features.Users.Commands.ApprovePartner;

/// <summary>
/// Duyệt hồ sơ đăng ký của một Partner: Status → Active, IsActive → true, ApprovedAt = now.
/// </summary>
public class ApprovePartnerCommand : IRequest<bool>
{
    [JsonIgnore]
    public int Id { get; set; }
}
