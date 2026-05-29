using MediatR;
using System.Text.Json.Serialization;

namespace WanderVN.Application.Features.Users.Commands.RejectPartner;

/// <summary>
/// Từ chối hồ sơ đăng ký của một Partner: Status → Rejected, lưu RejectReason. IsActive giữ false.
/// </summary>
public class RejectPartnerCommand : IRequest<bool>
{
    [JsonIgnore]
    public int Id { get; set; }

    public string RejectReason { get; set; } = string.Empty;
}
