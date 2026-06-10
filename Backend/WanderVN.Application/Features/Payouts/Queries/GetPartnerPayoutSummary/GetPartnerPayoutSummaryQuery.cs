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
    private readonly IUnitOfWork _unitOfWork;

    public GetPartnerPayoutSummaryQueryHandler(
        IPartnerPayoutRepository payoutRepository,
        ICurrentUserService currentUser,
        IUnitOfWork unitOfWork)
    {
        _payoutRepository = payoutRepository;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<PartnerPayoutSummaryDto> Handle(GetPartnerPayoutSummaryQuery request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Không thể xác định danh tính đối tác.");

        var stats = await _payoutRepository.GetPartnerSummaryStatsAsync(partnerId, cancellationToken);
        var user = await _unitOfWork.Users.GetByIdAsync(partnerId, cancellationToken);

        return new PartnerPayoutSummaryDto
        {
            GrossTotal = stats.GrossTotal,
            CommissionTotal = stats.CommissionTotal,
            NetTotal = stats.NetTotal,
            PendingBalance = stats.PendingBalance,
            PaidThisMonth = stats.PaidThisMonth,
            CommissionRate = stats.CommissionRate,
            BankName = user?.BankName,
            BankAccountNumber = user?.BankAccountNumber,
            BankAccountName = user?.BankAccountName,
            BankBin = user?.BankBin
        };
    }
}
