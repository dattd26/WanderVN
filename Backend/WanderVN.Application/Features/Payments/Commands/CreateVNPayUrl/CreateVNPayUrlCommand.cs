using MediatR;

namespace WanderVN.Application.Features.Payments.Commands.CreateVNPayUrl;

/// <summary>
/// Command yêu cầu khởi tạo URL thanh toán VNPay cho một đơn đặt dịch vụ (Booking).
/// </summary>
public class CreateVNPayUrlCommand : IRequest<string>
{
    /// <summary>
    /// ID của đặt phòng/vé trong cơ sở dữ liệu.
    /// </summary>
    public int BookingId { get; set; }

    /// <summary>
    /// Địa chỉ IP của máy khách hàng gửi yêu cầu thanh toán.
    /// </summary>
    public string IpAddress { get; set; } = null!;
}
