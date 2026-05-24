using System.Text.Json.Serialization;

namespace WanderVN.Application.DTOs.Response;

/// <summary>
/// DTO phản hồi dành riêng cho cổng thanh toán ZaloPay sau khi xử lý callback thành công.
/// </summary>
public class ZaloPayCallbackResponse
{
    /// <summary>
    /// Mã trạng thái trả về (1: Thành công, 2: Thất bại).
    /// </summary>
    [JsonPropertyName("return_code")]
    public int ReturnCode { get; set; }

    /// <summary>
    /// Thông báo kết quả xử lý.
    /// </summary>
    [JsonPropertyName("return_message")]
    public string ReturnMessage { get; set; } = null!;
}
