using MediatR;
using WanderVN.Application.Features.Payouts.Queries.GetPayouts;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payouts.Queries.GetPayoutStats;

public class GetPayoutStatsQueryHandler : IRequestHandler<GetPayoutStatsQuery, PayoutStatsDto>
{
    private readonly IPartnerPayoutRepository _payoutRepository;

    public GetPayoutStatsQueryHandler(IPartnerPayoutRepository payoutRepository)
    {
        _payoutRepository = payoutRepository;
    }

    public async Task<PayoutStatsDto> Handle(GetPayoutStatsQuery request, CancellationToken cancellationToken)
    {
        var stats = await _payoutRepository.GetPayoutStatsAsync(cancellationToken);

        return new PayoutStatsDto
        {
            TotalNetPending = stats.TotalNetPending,
            TotalCommission = stats.TotalCommission,
            TotalRevenue = stats.TotalRevenue,
            ActivePartners = stats.ActivePartners
        };
    }
}
