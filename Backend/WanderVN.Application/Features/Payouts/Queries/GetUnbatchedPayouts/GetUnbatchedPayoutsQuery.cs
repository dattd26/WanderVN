using MediatR;
using WanderVN.Application.Features.Payouts.Queries.GetPayouts;
using System.Collections.Generic;

namespace WanderVN.Application.Features.Payouts.Queries.GetUnbatchedPayouts;

public class GetUnbatchedPayoutsQuery : IRequest<List<PayoutDto>>
{
    public int PartnerId { get; set; }
}
