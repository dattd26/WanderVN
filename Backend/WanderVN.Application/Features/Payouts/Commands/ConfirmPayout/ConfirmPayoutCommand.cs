using MediatR;

namespace WanderVN.Application.Features.Payouts.Commands.ConfirmPayout;

public class ConfirmPayoutCommand : IRequest<bool>
{
    public int Id { get; set; }
    public string? TransactionReference { get; set; }
    public string? PayoutMethod { get; set; }
}
