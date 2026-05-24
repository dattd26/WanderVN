namespace WanderVN.Application.DTOs.Request;

/// <summary>
/// DTO chứa tham số yêu cầu tạo link thanh toán ZaloPay.
/// </summary>
public class CreateZaloPayUrlRequestDto
{
    /// <summary>
    /// ID của đơn đặt hàng cần thanh toán.
    /// </summary>
    public int BookingId { get; set; }
}
