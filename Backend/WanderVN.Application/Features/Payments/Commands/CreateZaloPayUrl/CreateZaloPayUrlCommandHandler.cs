using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Utils;
using WanderVN.Domain.Repositories;
using WanderVN.Domain.Enums;

namespace WanderVN.Application.Features.Payments.Commands.CreateZaloPayUrl;

/// <summary>
/// Bộ xử lý Command khởi tạo URL thanh toán ZaloPay.
/// </summary>
public class CreateZaloPayUrlCommandHandler : IRequestHandler<CreateZaloPayUrlCommand, string>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IZaloPayService _zalopayService;

    public CreateZaloPayUrlCommandHandler(IUnitOfWork unitOfWork, IZaloPayService zalopayService)
    {
        _unitOfWork = unitOfWork;
        _zalopayService = zalopayService;
    }

    /// <summary>
    /// Xử lý lấy thông tin hóa đơn và tạo đường dẫn thanh toán qua ZaloPay.
    /// </summary>
    public async Task<string> Handle(CreateZaloPayUrlCommand command, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra sự tồn tại của đơn đặt phòng/vé trong cơ sở dữ liệu qua Repository
        var booking = await _unitOfWork.Bookings.FindFirstOrDefaultAsync(
            b => b.Id == command.BookingId,
            cancellationToken: cancellationToken);

        if (booking == null)
        {
            throw new Exception($"Không tìm thấy đơn đặt hàng nào có ID là {command.BookingId}");
        }

        if (booking.PaymentStatus == BookingPaymentStatus.Paid)
        {
            throw new Exception("Đơn đặt hàng này đã được thanh toán trước đó.");
        }

        var expirationMinutes = await BookingPaymentExpirationHelper.GetUnpaidBookingExpirationMinutesAsync(_unitOfWork, cancellationToken);
        if (BookingPaymentExpirationHelper.IsExpiredUnpaidHotelBooking(booking, expirationMinutes, DateTimeOffset.UtcNow))
        {
            throw new Exception("Đơn đặt hàng đã quá hạn thanh toán.");
        }

        if (booking.Status != BookingStatus.Pending || booking.PaymentStatus != BookingPaymentStatus.Unpaid)
        {
            throw new Exception("Đơn đặt hàng này không còn ở trạng thái chờ thanh toán.");
        }

        // 2. Tạo URL thanh toán ZaloPay bằng cách gọi ZaloPayService với thông tin loại dịch vụ
        string paymentUrl = await _zalopayService.CreatePaymentUrlAsync(booking.Id, booking.TotalPrice, booking.ServiceType.ToString());

        return paymentUrl;
    }
}
