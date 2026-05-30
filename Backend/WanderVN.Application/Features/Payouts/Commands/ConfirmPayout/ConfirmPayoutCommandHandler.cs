using MediatR;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Domain.Enums;

namespace WanderVN.Application.Features.Payouts.Commands.ConfirmPayout;

public class ConfirmPayoutCommandHandler : IRequestHandler<ConfirmPayoutCommand, bool>
{
    private readonly IPartnerPayoutRepository _payoutRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ConfirmPayoutCommandHandler(IPartnerPayoutRepository payoutRepository, IUnitOfWork unitOfWork)
    {
        _payoutRepository = payoutRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ConfirmPayoutCommand request, CancellationToken cancellationToken)
    {
        var payout = await _payoutRepository.GetByIdAsync(request.Id, cancellationToken);

        if (payout == null)
            throw new KeyNotFoundException($"Không tìm thấy khoản thanh toán với ID = {request.Id}.");

        if (payout.Status == PayoutStatus.Paid)
            throw new ArgumentException("Khoản thanh toán này đã được xác nhận chi trả trước đó.");

        if (payout.Status == PayoutStatus.Cancelled)
            throw new ArgumentException("Không thể xác nhận một khoản thanh toán đã bị từ chối/hủy bỏ.");

        payout.Status = PayoutStatus.Paid;
        payout.PaidAt = DateTimeOffset.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.TransactionReference))
            payout.TransactionReference = request.TransactionReference.Trim();

        if (!string.IsNullOrWhiteSpace(request.PayoutMethod))
            payout.PayoutMethod = request.PayoutMethod.Trim();

        _payoutRepository.Update(payout);

        // Đồng bộ trạng thái Booking sang Settled
        var booking = await _unitOfWork.Bookings.GetByIdAsync(payout.BookingId, cancellationToken);
        if (booking != null)
        {
            booking.Status = BookingStatus.Settled;
            _unitOfWork.Bookings.Update(booking);
        }

        var result = await _unitOfWork.SaveChangesAsync(cancellationToken);
        return result > 0;
    }
}
