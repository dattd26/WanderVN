using MediatR;
using WanderVN.Application.Features.Payouts.Queries.GetAdminBatches;
using WanderVN.Domain.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WanderVN.Application.Features.Payouts.Queries.GetAdminBatchDetail;

public class GetAdminBatchDetailQueryHandler : IRequestHandler<GetAdminBatchDetailQuery, AdminBatchDto>
{
    private readonly IPartnerPayoutRepository _payoutRepository;

    public GetAdminBatchDetailQueryHandler(IPartnerPayoutRepository payoutRepository)
    {
        _payoutRepository = payoutRepository;
    }

    public async Task<AdminBatchDto> Handle(GetAdminBatchDetailQuery request, CancellationToken cancellationToken)
    {
        var b = await _payoutRepository.GetBatchDetailsByIdAsync(request.Id, cancellationToken);
        if (b == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy đợt chi trả với ID = {request.Id}.");
        }

        return new AdminBatchDto
        {
            Id = b.Id,
            BatchCode = b.BatchCode,
            PartnerId = b.PartnerId,
            PartnerName = b.Partner?.FullName,
            PartnerEmail = b.Partner?.Email,
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
        };
    }
}
