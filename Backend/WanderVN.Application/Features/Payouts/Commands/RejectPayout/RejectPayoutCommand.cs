using MediatR;

namespace WanderVN.Application.Features.Payouts.Commands.RejectPayout;

public class RejectPayoutCommand : IRequest<bool>
{
    public int Id { get; set; }
    public string? Reason { get; set; }
}
