using MediatR;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace WanderVN.Application.Features.Payouts.Commands.ConfirmBatch;

public class ConfirmBatchCommandHandler : IRequestHandler<ConfirmBatchCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPartnerPayoutRepository _payoutRepository;

    public ConfirmBatchCommandHandler(IUnitOfWork unitOfWork, IPartnerPayoutRepository payoutRepository)
    {
        _unitOfWork = unitOfWork;
        _payoutRepository = payoutRepository;
    }

    public async Task<bool> Handle(ConfirmBatchCommand request, CancellationToken cancellationToken)
    {
        var batch = await _payoutRepository.GetBatchDetailsByIdAsync(request.BatchId, cancellationToken);
        if (batch == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy đợt chi trả với ID = {request.BatchId}.");
        }

        if (batch.Status != BatchStatus.Processing)
        {
            throw new ArgumentException("Đợt chi trả này đã được xác nhận thanh toán hoặc bị hủy.");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var paidTime = DateTimeOffset.UtcNow;
            
            // Cập nhật trạng thái batch
            batch.Status = BatchStatus.Paid;
            batch.PaidAt = paidTime;
            batch.TransactionReference = request.TransactionReference?.Trim();

            _unitOfWork.PayoutBatches.Update(batch);

            // Cập nhật từng payout con và booking tương ứng
            foreach (var payout in batch.Payouts)
            {
                payout.Status = PayoutStatus.Paid;
                payout.PaidAt = paidTime;
                payout.TransactionReference = request.TransactionReference?.Trim();
                _payoutRepository.Update(payout);

                // Đồng bộ trạng thái Booking sang Settled
                var booking = await _unitOfWork.Bookings.GetByIdAsync(payout.BookingId, cancellationToken);
                if (booking != null)
                {
                    booking.Status = BookingStatus.Settled;
                    _unitOfWork.Bookings.Update(booking);
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return true;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
