namespace WanderVN.Application.DTOs.Response;

/// <summary>
/// Đối tượng phản hồi dành riêng cho cổng thanh toán VNPay khi xử lý IPN.
/// </summary>
public class VNPayIpnResponse
{
    /// <summary>
    /// Mã lỗi phản hồi (Ví dụ: "00" là thành công, "97" là sai chữ ký, v.v.).
    /// </summary>
    public string RspCode { get; set; } = null!;

    /// <summary>
    /// Thông báo mô tả kết quả xử lý.
    /// </summary>
    public string Message { get; set; } = null!;
}
