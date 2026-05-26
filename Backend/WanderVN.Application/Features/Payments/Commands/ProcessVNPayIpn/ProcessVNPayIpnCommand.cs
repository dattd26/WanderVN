using System.Collections.Generic;
using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Payments.Commands.ProcessVNPayIpn;

/// <summary>
/// Command xử lý phản hồi IPN (Server-to-Server) nhận từ VNPay.
/// </summary>
public class ProcessVNPayIpnCommand : IRequest<VNPayIpnResponse>
{
    /// <summary>
    /// Tập hợp các tham số truy vấn do VNPay gửi đến Server.
    /// </summary>
    public IDictionary<string, string> Parameters { get; set; } = new Dictionary<string, string>();
}
