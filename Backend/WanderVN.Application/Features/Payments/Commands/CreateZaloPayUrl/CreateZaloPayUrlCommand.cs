using MediatR;

namespace WanderVN.Application.Features.Payments.Commands.CreateZaloPayUrl;

/// <summary>
/// Command yêu cầu khởi tạo URL thanh toán ZaloPay cho một đơn đặt dịch vụ (Booking).
/// </summary>
public class CreateZaloPayUrlCommand : IRequest<string>
{
    /// <summary>
    /// ID của đặt phòng/vé trong cơ sở dữ liệu.
    /// </summary>
    public int BookingId { get; set; }
}
