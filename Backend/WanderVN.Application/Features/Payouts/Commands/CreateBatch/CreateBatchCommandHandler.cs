using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WanderVN.Application.Features.Payouts.Commands.CreateBatch;

public class CreateBatchCommandHandler : IRequestHandler<CreateBatchCommand, int>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPartnerPayoutRepository _payoutRepository;

    public CreateBatchCommandHandler(IUnitOfWork unitOfWork, IPartnerPayoutRepository payoutRepository)
    {
        _unitOfWork = unitOfWork;
        _payoutRepository = payoutRepository;
    }

    public async Task<int> Handle(CreateBatchCommand request, CancellationToken cancellationToken)
    {
        if (request.PayoutIds == null || !request.PayoutIds.Any())
        {
            throw new ArgumentException("Danh sách khoản thanh toán gom đợt không được rỗng.");
        }

        // Bắt đầu một transaction để đảm bảo toàn vẹn dữ liệu khi gom đợt
        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var payoutsToBatch = new List<PartnerPayouts>();
            foreach (var id in request.PayoutIds)
            {
                var payout = await _payoutRepository.GetByIdAsync(id, cancellationToken);
                if (payout == null)
                {
                    throw new KeyNotFoundException($"Không tìm thấy khoản thanh toán với ID = {id}.");
                }

                if (payout.PartnerId != request.PartnerId)
                {
                    throw new ArgumentException($"Khoản thanh toán ID = {id} không thuộc về đối tác ID = {request.PartnerId}.");
                }

                if (payout.Status != PayoutStatus.Pending)
                {
                    throw new ArgumentException($"Khoản thanh toán ID = {id} không ở trạng thái Chờ xử lý (Pending) để gom đợt.");
                }

                if (payout.BatchId != null)
                {
                    throw new ArgumentException($"Khoản thanh toán ID = {id} đã thuộc đợt chi trả khác.");
                }

                payoutsToBatch.Add(payout);
            }

            // Sinh mã đợt chi trả tự động (PO-yyyyMMdd-XXXX)
            var todayStr = DateTimeOffset.UtcNow.ToString("yyyyMMdd");
            var todayBatches = await _unitOfWork.PayoutBatches.FindAsync(
                b => b.BatchCode.StartsWith($"PO-{todayStr}"),
                cancellationToken);
            var batchCountToday = todayBatches.Count();
            
            var sequenceNumber = (batchCountToday + 1).ToString("D4");
            var batchCode = $"PO-{todayStr}-{sequenceNumber}";

            // Tính tổng tiền & số lượng booking
            var totalGross = payoutsToBatch.Sum(p => p.GrossAmount);
            var totalCommission = payoutsToBatch.Sum(p => p.CommissionAmount);
            var totalNet = payoutsToBatch.Sum(p => p.NetAmount);
            var bookingCount = payoutsToBatch.Count;

            var newBatch = new PayoutBatches
            {
                BatchCode = batchCode,
                PartnerId = request.PartnerId,
                TotalGross = totalGross,
                TotalCommission = totalCommission,
                TotalNet = totalNet,
                BookingCount = bookingCount,
                Status = BatchStatus.Processing,
                Note = request.Note?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            // Lưu batch mới
            await _unitOfWork.PayoutBatches.AddAsync(newBatch, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Cập nhật các payout con: gán BatchId và chuyển sang Processing
            foreach (var payout in payoutsToBatch)
            {
                payout.BatchId = newBatch.Id;
                payout.Status = PayoutStatus.Processing;
                _payoutRepository.Update(payout);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return newBatch.Id;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
