using MediatR;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payouts.Queries.GetPayouts;

public class GetPayoutsQueryHandler : IRequestHandler<GetPayoutsQuery, PagedResult<PayoutDto>>
{
    private readonly IPartnerPayoutRepository _payoutRepository;

    public GetPayoutsQueryHandler(IPartnerPayoutRepository payoutRepository)
    {
        _payoutRepository = payoutRepository;
    }

    public async Task<PagedResult<PayoutDto>> Handle(GetPayoutsQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(request.PageNumber, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalItems) = await _payoutRepository.GetPagedPayoutsAsync(
            request.Keyword,
            request.Status,
            request.FromDate,
            request.ToDate,
            pageNumber,
            pageSize,
            cancellationToken);

        var dtos = items.Select(p => new PayoutDto
        {
            Id = p.Id,
            PartnerId = p.PartnerId,
            PartnerName = p.Partner?.FullName,
            PartnerEmail = p.Partner?.Email,
            PartnerAvatarUrl = p.Partner?.AvatarUrl,

            BookingId = p.BookingId,
            BookingCode = p.Booking?.BookingCode ?? string.Empty,
            ServiceType = p.Booking?.ServiceType ?? string.Empty,
            BookingStatus = p.Booking?.Status,
            PaymentStatus = p.Booking?.PaymentStatus,
            BookingCreatedAt = p.Booking?.CreatedAt,

            GrossAmount = p.GrossAmount,
            CommissionAmount = p.CommissionAmount,
            NetAmount = p.NetAmount,

            Status = p.Status,
            PayoutMethod = p.PayoutMethod,
            PaidAt = p.PaidAt,
            TransactionReference = p.TransactionReference,
            CreatedAt = p.CreatedAt
        }).ToList();

        return new PagedResult<PayoutDto>(dtos, totalItems, pageNumber, pageSize);
    }
}
