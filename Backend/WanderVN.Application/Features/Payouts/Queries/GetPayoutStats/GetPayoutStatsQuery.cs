using MediatR;
using WanderVN.Application.Features.Payouts.Queries.GetPayouts;

namespace WanderVN.Application.Features.Payouts.Queries.GetPayoutStats;

public class GetPayoutStatsQuery : IRequest<PayoutStatsDto>
{
}
