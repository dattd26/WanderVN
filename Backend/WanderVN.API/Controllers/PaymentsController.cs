using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Payments.Commands.CreateVNPayUrl;
using WanderVN.Application.Features.Payments.Commands.ProcessVNPayIpn;

namespace WanderVN.API.Controllers;

[Route("api/v1/payments")]
[ApiController]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Kênh tạo URL thanh toán VNPay cho đơn hàng.
    /// </summary>
    [HttpPost("create-vnpay-url")]
    public async Task<IActionResult> CreateVNPayUrl([FromBody] CreateVNPayUrlRequestDto request)
    {
        var command = new CreateVNPayUrlCommand
        {
            BookingId = request.BookingId,
            IpAddress = GetIpAddress()
        };

        try
        {
            var paymentUrl = await _mediator.Send(command);
            var response = new ApiResponse<string>(true, "Khoi tao URL thanh toan VNPay thanh cong", 200, paymentUrl);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            var response = new ApiResponse<string>(false, ex.Message, 400, string.Empty);
            return BadRequest(response);
        }
    }

    /// <summary>
    /// Đầu nhận Webhook IPN (Server-to-Server) cực kỳ quan trọng từ VNPay để cập nhật tự động trạng thái đơn hàng.
    /// Lưu ý: VNPay yêu cầu định dạng trả về thô (Raw JSON) dạng {"RspCode": "...", "Message": "..."} 
    /// nên không bọc qua lớp ApiResponse.
    /// </summary>
    [HttpGet("vnpay-ipn")]
    public async Task<IActionResult> VNPayIpn()
    {
        // Chuyển đổi toàn bộ Query String nhận được thành Dictionary<string, string>
        var parameters = Request.Query.ToDictionary(
            x => x.Key,
            x => x.Value.ToString()
        );

        var command = new ProcessVNPayIpnCommand
        {
            Parameters = parameters
        };

        var result = await _mediator.Send(command);

        // Trả về trực tiếp object VNPayIpnResponse thô theo chuẩn của tài liệu VNPay
        return Ok(result);
    }

    /// <summary>
    /// Hàm hỗ trợ lấy địa chỉ IP của Client gửi yêu cầu (hỗ trợ cả trường hợp đi qua Proxy/Load Balancer).
    /// </summary>
    private string GetIpAddress()
    {
        string? ipAddress = HttpContext.Request.Headers["X-Forwarded-For"];

        if (!string.IsNullOrEmpty(ipAddress))
        {
            var addresses = ipAddress.Split(',');
            if (addresses.Length != 0)
            {
                return addresses[0].Trim();
            }
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
    }
}

/// <summary>
/// DTO chứa tham số yêu cầu tạo link thanh toán VNPay.
/// </summary>
public class CreateVNPayUrlRequestDto
{
    public int BookingId { get; set; }
}
