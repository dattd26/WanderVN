using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Payments.Commands.ProcessZaloPayCallback;

/// <summary>
/// Command xử lý callback Webhook tiếp nhận từ ZaloPay Server khi thanh toán hoàn tất.
/// </summary>
public class ProcessZaloPayCallbackCommand : IRequest<ZaloPayCallbackResponse>
{
    /// <summary>
    /// Chuỗi JSON thô chứa dữ liệu giao dịch chi tiết do ZaloPay gửi về.
    /// </summary>
    public string Data { get; set; } = null!;

    /// <summary>
    /// Chữ ký bảo mật (mac) dùng để xác thực nguồn gốc và tính toàn vẹn của dữ liệu.
    /// </summary>
    public string Mac { get; set; } = null!;
}
