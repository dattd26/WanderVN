using MediatR;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace WanderVN.Application.Features.Payouts.Commands.CancelBatch;

public class CancelBatchCommandHandler : IRequestHandler<CancelBatchCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPartnerPayoutRepository _payoutRepository;

    public CancelBatchCommandHandler(IUnitOfWork unitOfWork, IPartnerPayoutRepository payoutRepository)
    {
        _unitOfWork = unitOfWork;
        _payoutRepository = payoutRepository;
    }

    public async Task<bool> Handle(CancelBatchCommand request, CancellationToken cancellationToken)
    {
        var batch = await _payoutRepository.GetBatchDetailsByIdAsync(request.BatchId, cancellationToken);
        if (batch == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy đợt chi trả với ID = {request.BatchId}.");
        }

        if (batch.Status != BatchStatus.Processing)
        {
            throw new ArgumentException("Chỉ có thể hủy đợt chi trả đang trong trạng thái Đang xử lý (Processing).");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            // Cập nhật trạng thái batch sang Cancelled
            batch.Status = BatchStatus.Cancelled;
            if (!string.IsNullOrWhiteSpace(request.Reason))
            {
                batch.Note = string.IsNullOrWhiteSpace(batch.Note) 
                    ? $"Hủy đợt: {request.Reason.Trim()}" 
                    : $"{batch.Note} | Lý do hủy: {request.Reason.Trim()}";
            }
            _unitOfWork.PayoutBatches.Update(batch);

            // Hoàn tác các payout con trở lại Pending
            foreach (var payout in batch.Payouts)
            {
                payout.Status = PayoutStatus.Pending;
                payout.BatchId = null;
                payout.PaidAt = null;
                payout.TransactionReference = null;
                _payoutRepository.Update(payout);
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
