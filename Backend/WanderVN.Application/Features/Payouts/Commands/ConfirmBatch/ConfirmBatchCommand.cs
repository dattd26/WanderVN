using MediatR;

namespace WanderVN.Application.Features.Payouts.Commands.ConfirmBatch;

public class ConfirmBatchCommand : IRequest<bool>
{
    public int BatchId { get; set; }
    public string? TransactionReference { get; set; }
}
