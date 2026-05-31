using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payouts.Queries.GetPartnerBatches;

public class GetPartnerBatchesQuery : IRequest<PagedResult<PartnerBatchDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class GetPartnerBatchesQueryHandler : IRequestHandler<GetPartnerBatchesQuery, PagedResult<PartnerBatchDto>>
{
    private readonly IPartnerPayoutRepository _payoutRepository;
    private readonly ICurrentUserService _currentUser;

    public GetPartnerBatchesQueryHandler(
        IPartnerPayoutRepository payoutRepository,
        ICurrentUserService currentUser)
    {
        _payoutRepository = payoutRepository;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<PartnerBatchDto>> Handle(GetPartnerBatchesQuery request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Không thể xác định danh tính đối tác.");

        var (items, totalCount) = await _payoutRepository.GetPartnerPagedBatchesAsync(
            partnerId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(b => new PartnerBatchDto
        {
            Id = b.Id,
            BatchCode = b.BatchCode,
            TotalGross = b.TotalGross,
            TotalCommission = b.TotalCommission,
            TotalNet = b.TotalNet,
            BookingCount = b.BookingCount,
            Status = b.Status.ToString(),
            Note = b.Note,
            PaidAt = b.PaidAt,
            TransactionReference = b.TransactionReference,
            CreatedAt = b.CreatedAt,
            Payouts = b.Payouts.Select(p => new BatchPayoutDto
            {
                Id = p.Id,
                BookingCode = p.Booking.BookingCode,
                NetAmount = p.NetAmount
            }).ToList()
        }).ToList();

        return new PagedResult<PartnerBatchDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
