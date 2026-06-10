using MediatR;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using WanderVN.Domain.Repositories;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WanderVN.Application.Features.Payouts.Queries.GetAdminBatches;

public class GetAdminBatchesQueryHandler : IRequestHandler<GetAdminBatchesQuery, PagedResult<AdminBatchDto>>
{
    private readonly IPartnerPayoutRepository _payoutRepository;

    public GetAdminBatchesQueryHandler(IPartnerPayoutRepository payoutRepository)
    {
        _payoutRepository = payoutRepository;
    }

    public async Task<PagedResult<AdminBatchDto>> Handle(GetAdminBatchesQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _payoutRepository.GetAdminPagedBatchesAsync(
            request.PartnerKeyword,
            request.Status,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(b => new AdminBatchDto
        {
            Id = b.Id,
            BatchCode = b.BatchCode,
            PartnerId = b.PartnerId,
            PartnerName = b.Partner?.FullName,
            PartnerEmail = b.Partner?.Email,
            BankName = b.Partner?.BankName,
            BankAccountNumber = b.Partner?.BankAccountNumber,
            BankAccountName = b.Partner?.BankAccountName,
            BankBin = b.Partner?.BankBin,
            TotalGross = b.TotalGross,
            TotalCommission = b.TotalCommission,
            TotalNet = b.TotalNet,
            BookingCount = b.BookingCount,
            Status = b.Status.ToString(),
            Note = b.Note,
            PaidAt = b.PaidAt,
            TransactionReference = b.TransactionReference,
            CreatedAt = b.CreatedAt,
            Payouts = b.Payouts.Select(p => new BatchPayoutItemDto
            {
                Id = p.Id,
                BookingCode = p.Booking?.BookingCode ?? string.Empty,
                ServiceType = p.Booking != null ? p.Booking.ServiceType.ToString() : string.Empty,
                GrossAmount = p.GrossAmount,
                CommissionAmount = p.CommissionAmount,
                NetAmount = p.NetAmount,
                Status = p.Status.ToString()
            }).ToList()
        }).ToList();

        return new PagedResult<AdminBatchDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
