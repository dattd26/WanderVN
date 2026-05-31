using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payouts.Queries.GetPartnerPayoutSummary;

public class GetPartnerPayoutSummaryQuery : IRequest<PartnerPayoutSummaryDto>
{
}

public class GetPartnerPayoutSummaryQueryHandler : IRequestHandler<GetPartnerPayoutSummaryQuery, PartnerPayoutSummaryDto>
{
    private readonly IPartnerPayoutRepository _payoutRepository;
    private readonly ICurrentUserService _currentUser;

    public GetPartnerPayoutSummaryQueryHandler(
        IPartnerPayoutRepository payoutRepository,
        ICurrentUserService currentUser)
    {
        _payoutRepository = payoutRepository;
        _currentUser = currentUser;
    }

    public async Task<PartnerPayoutSummaryDto> Handle(GetPartnerPayoutSummaryQuery request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Không thể xác định danh tính đối tác.");

        var stats = await _payoutRepository.GetPartnerSummaryStatsAsync(partnerId, cancellationToken);

        return new PartnerPayoutSummaryDto
        {
            GrossTotal = stats.GrossTotal,
            CommissionTotal = stats.CommissionTotal,
            NetTotal = stats.NetTotal,
            PendingBalance = stats.PendingBalance,
            PaidThisMonth = stats.PaidThisMonth,
            CommissionRate = stats.CommissionRate
        };
    }
}
