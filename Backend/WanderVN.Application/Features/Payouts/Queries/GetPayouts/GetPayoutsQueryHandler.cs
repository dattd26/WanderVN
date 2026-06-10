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
            BankName = p.Partner?.BankName,
            BankAccountNumber = p.Partner?.BankAccountNumber,
            BankAccountName = p.Partner?.BankAccountName,
            BankBin = p.Partner?.BankBin,

            BookingId = p.BookingId,
            BookingCode = p.Booking?.BookingCode ?? string.Empty,
            ServiceType = p.Booking != null ? p.Booking.ServiceType.ToString() : string.Empty,
            BookingStatus = p.Booking != null ? p.Booking.Status.ToString() : string.Empty,
            PaymentStatus = p.Booking != null ? p.Booking.PaymentStatus.ToString() : string.Empty,
            BookingCreatedAt = p.Booking?.CreatedAt,

            GrossAmount = p.GrossAmount,
            CommissionAmount = p.CommissionAmount,
            NetAmount = p.NetAmount,

            Status = p.Status.ToString(),
            PayoutMethod = p.PayoutMethod,
            PaidAt = p.PaidAt,
            TransactionReference = p.TransactionReference,
            CheckedOutAt = p.Booking?.CheckedOutAt,
            CreatedAt = p.CreatedAt
        }).ToList();

        return new PagedResult<PayoutDto>(dtos, totalItems, pageNumber, pageSize);
    }
}
