using MediatR;
using WanderVN.Application.Features.Payouts.Queries.GetPayouts;
using WanderVN.Domain.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WanderVN.Application.Features.Payouts.Queries.GetUnbatchedPayouts;

public class GetUnbatchedPayoutsQueryHandler : IRequestHandler<GetUnbatchedPayoutsQuery, List<PayoutDto>>
{
    private readonly IPartnerPayoutRepository _payoutRepository;

    public GetUnbatchedPayoutsQueryHandler(IPartnerPayoutRepository payoutRepository)
    {
        _payoutRepository = payoutRepository;
    }

    public async Task<List<PayoutDto>> Handle(GetUnbatchedPayoutsQuery request, CancellationToken cancellationToken)
    {
        var payouts = await _payoutRepository.GetUnbatchedPendingPayoutsAsync(request.PartnerId, cancellationToken);

        return payouts.Select(p => new PayoutDto
        {
            Id = p.Id,
            PartnerId = p.PartnerId,
            PartnerName = p.Partner?.FullName,
            PartnerEmail = p.Partner?.Email,
            PartnerAvatarUrl = p.Partner?.AvatarUrl,
            BookingId = p.BookingId,
            BookingCode = p.Booking?.BookingCode ?? string.Empty,
            ServiceType = p.Booking != null ? p.Booking.ServiceType.ToString() : string.Empty,
            BookingStatus = p.Booking != null ? p.Booking.Status.ToString() : string.Empty,
            GrossAmount = p.GrossAmount,
            CommissionAmount = p.CommissionAmount,
            NetAmount = p.NetAmount,
            Status = p.Status.ToString(),
            PayoutMethod = p.PayoutMethod,
            PaidAt = p.PaidAt,
            TransactionReference = p.TransactionReference,
            CreatedAt = p.CreatedAt
        }).ToList();
    }
}
