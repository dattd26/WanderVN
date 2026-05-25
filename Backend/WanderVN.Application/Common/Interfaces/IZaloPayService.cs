using System.Threading.Tasks;

namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Giao diện cung cấp các phương thức tích hợp với cổng thanh toán ví điện tử ZaloPay.
/// </summary>
public interface IZaloPayService
{
    /// <summary>
    /// Tạo đường dẫn thanh toán (order_url) từ hệ thống ZaloPay Sandbox.
    /// </summary>
    /// <param name="bookingId">ID đơn đặt hàng trong hệ thống.</param>
    /// <param name="amount">Số tiền thanh toán.</param>
    /// <param name="serviceType">Loại dịch vụ đặt chỗ (Hotel hoặc Flight).</param>
    /// <returns>Đường dẫn thanh toán order_url của ZaloPay.</returns>
    Task<string> CreatePaymentUrlAsync(int bookingId, decimal amount, string serviceType);

    /// <summary>
    /// Xác thực chữ ký dữ liệu (checksum/mac) phản hồi gửi về từ ZaloPay qua webhook callback.
    /// </summary>
    /// <param name="data">Chuỗi dữ liệu thô JSON nhận được từ trường "data" của callback.</param>
    /// <param name="reqMac">Chữ ký "mac" nhận được từ callback để đối chứng.</param>
    /// <returns>Trả về true nếu chữ ký hợp lệ và khớp với tính toán, ngược lại trả về false.</returns>
    bool ValidateSignature(string data, string reqMac);
}
