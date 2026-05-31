using MediatR;

namespace WanderVN.Application.Features.Payouts.Commands.CancelBatch;

public class CancelBatchCommand : IRequest<bool>
{
    public int BatchId { get; set; }
    public string? Reason { get; set; }
}
