using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payments.Commands.CreateVNPayUrl;

/// <summary>
/// Bộ xử lý Command khởi tạo URL thanh toán VNPay.
/// </summary>
public class CreateVNPayUrlCommandHandler : IRequestHandler<CreateVNPayUrlCommand, string>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVNPayService _vnpayService;

    public CreateVNPayUrlCommandHandler(IUnitOfWork unitOfWork, IVNPayService vnpayService)
    {
        _unitOfWork = unitOfWork;
        _vnpayService = vnpayService;
    }

    /// <summary>
    /// Xử lý việc lấy thông tin hóa đơn và tạo URL thanh toán.
    /// </summary>
    public async Task<string> Handle(CreateVNPayUrlCommand command, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra sự tồn tại của đơn đặt phòng/vé trong cơ sở dữ liệu qua Repository
        var booking = await _unitOfWork.Bookings.FindFirstOrDefaultAsync(
            b => b.Id == command.BookingId,
            cancellationToken: cancellationToken);

        if (booking == null)
        {
            throw new Exception($"Không tìm thấy đơn đặt hàng nào có ID là {command.BookingId}");
        }

        if (booking.PaymentStatus == "Paid")
        {
            throw new Exception("Đơn đặt hàng này đã được thanh toán trước đó.");
        }

        // 2. Tạo URL thanh toán VNPay bằng cách gọi VNPayService với thông tin loại dịch vụ
        string paymentUrl = _vnpayService.CreatePaymentUrl(booking.Id, booking.TotalPrice, command.IpAddress, booking.ServiceType);

        return paymentUrl;
    }
}
