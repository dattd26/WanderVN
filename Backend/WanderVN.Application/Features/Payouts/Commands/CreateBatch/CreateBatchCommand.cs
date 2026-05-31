using MediatR;
using System.Collections.Generic;

namespace WanderVN.Application.Features.Payouts.Commands.CreateBatch;

public class CreateBatchCommand : IRequest<int>
{
    public int PartnerId { get; set; }
    public List<int> PayoutIds { get; set; } = new();
    public string? Note { get; set; }
}
