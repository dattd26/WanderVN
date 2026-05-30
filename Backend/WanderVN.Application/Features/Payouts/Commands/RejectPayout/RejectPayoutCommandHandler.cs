using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Domain.Enums;

namespace WanderVN.Application.Features.Payouts.Commands.RejectPayout;

public class RejectPayoutCommandHandler : IRequestHandler<RejectPayoutCommand, bool>
{
    private readonly IPartnerPayoutRepository _payoutRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RejectPayoutCommandHandler(IPartnerPayoutRepository payoutRepository, IUnitOfWork unitOfWork)
    {
        _payoutRepository = payoutRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RejectPayoutCommand request, CancellationToken cancellationToken)
    {
        var payout = await _payoutRepository.GetByIdAsync(request.Id, cancellationToken);

        if (payout == null)
            throw new KeyNotFoundException($"Không tìm thấy khoản thanh toán với ID = {request.Id}.");

        if (payout.Status != PayoutStatus.Pending && payout.Status != PayoutStatus.Processing)
            throw new ArgumentException("Chỉ có thể từ chối khoản thanh toán ở trạng thái Chờ thanh toán hoặc Đang xử lý.");

        payout.Status = PayoutStatus.Cancelled;
        
        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            payout.TransactionReference = $"Lý do từ chối: {request.Reason.Trim()}";
        }

        _payoutRepository.Update(payout);

        // Đồng bộ trạng thái Booking về Completed khi từ chối payout để có thể kiểm tra lại nếu cần
        var booking = await _unitOfWork.Bookings.GetByIdAsync(payout.BookingId, cancellationToken);
        if (booking != null)
        {
            booking.Status = BookingStatus.Completed;
            _unitOfWork.Bookings.Update(booking);
        }

        var result = await _unitOfWork.SaveChangesAsync(cancellationToken);
        return result > 0;
    }
}
