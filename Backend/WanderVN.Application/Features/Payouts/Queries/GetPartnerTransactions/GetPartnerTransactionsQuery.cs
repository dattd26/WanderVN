using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using WanderVN.Application.Features.Payouts.Queries.GetPayouts;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payouts.Queries.GetPartnerTransactions;

public class GetPartnerTransactionsQuery : IRequest<PagedResult<PayoutDto>>
{
    public string? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 15;
}

public class GetPartnerTransactionsQueryHandler : IRequestHandler<GetPartnerTransactionsQuery, PagedResult<PayoutDto>>
{
    private readonly IPartnerPayoutRepository _payoutRepository;
    private readonly ICurrentUserService _currentUser;

    public GetPartnerTransactionsQueryHandler(
        IPartnerPayoutRepository payoutRepository,
        ICurrentUserService currentUser)
    {
        _payoutRepository = payoutRepository;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<PayoutDto>> Handle(GetPartnerTransactionsQuery request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Không thể xác định danh tính đối tác.");

        var (items, totalCount) = await _payoutRepository.GetPartnerPagedPayoutsAsync(
            partnerId,
            request.Status,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(p => new PayoutDto
        {
            Id = p.Id,
            PartnerId = p.PartnerId,
            BookingId = p.BookingId,
            BookingCode = p.Booking.BookingCode,
            ServiceType = p.Booking.ServiceType.ToString(),
            BookingStatus = p.Booking.Status.ToString(),
            PaymentStatus = p.Booking.PaymentStatus.ToString(),
            BookingCreatedAt = p.Booking.CreatedAt,
            GrossAmount = p.GrossAmount,
            CommissionAmount = p.CommissionAmount,
            NetAmount = p.NetAmount,
            Status = p.Status.ToString(),
            PayoutMethod = p.PayoutMethod,
            PaidAt = p.PaidAt,
            TransactionReference = p.TransactionReference,
            CheckedOutAt = p.Booking.CheckedOutAt,
            CreatedAt = p.CreatedAt
        }).ToList();

        return new PagedResult<PayoutDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
