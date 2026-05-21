using System.Collections.Generic;

namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Interface cung cấp các phương thức tích hợp cổng thanh toán trực tuyến VNPay.
/// </summary>
public interface IVNPayService
{
    /// <summary>
    /// Tạo URL thanh toán VNPay dựa trên thông tin hóa đơn và IP/Địa chỉ của khách hàng.
    /// </summary>
    /// <param name="bookingId">ID của đặt phòng/đặt vé cần thanh toán.</param>
    /// <param name="amount">Số tiền cần thanh toán (VNĐ).</param>
    /// <param name="ipAddress">Địa chỉ IP của khách hàng gửi yêu cầu.</param>
    /// <returns>Chuỗi URL thanh toán VNPay.</returns>
    string CreatePaymentUrl(int bookingId, decimal amount, string ipAddress);

    /// <summary>
    /// Xác thực chữ ký phản hồi (checksum) từ VNPay gửi về (Return URL hoặc IPN URL).
    /// </summary>
    /// <param name="queryParameters">Danh sách các tham số truy vấn nhận được từ VNPay dạng Dictionary.</param>
    /// <returns>True nếu chữ ký hợp lệ, ngược lại là False.</returns>
    bool ValidateSignature(IDictionary<string, string> queryParameters);
}
