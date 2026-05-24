using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Utils;

namespace WanderVN.Infrastructure.Services;

/// <summary>
/// Thực thi dịch vụ tích hợp với cổng thanh toán ZaloPay Sandbox.
/// </summary>
public class ZaloPayService : IZaloPayService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public ZaloPayService(IConfiguration configuration, HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
    }

    /// <summary>
    /// Tạo đường dẫn thanh toán ZaloPay bằng cách gọi API v2 của ZaloPay Sandbox.
    /// </summary>
    public async Task<string> CreatePaymentUrlAsync(int bookingId, decimal amount)
    {
        // 1. Tải cấu hình ZaloPay từ ứng dụng
        var appIdStr = _configuration["ZaloPay:AppId"];
        var key1 = _configuration["ZaloPay:Key1"];
        var baseUrl = _configuration["ZaloPay:BaseUrl"];
        var callbackUrl = _configuration["ZaloPay:CallbackUrl"];
        var redirectUrl = _configuration["ZaloPay:RedirectUrl"];

        if (string.IsNullOrEmpty(appIdStr) || string.IsNullOrEmpty(key1) || string.IsNullOrEmpty(baseUrl))
        {
            throw new InvalidOperationException("Cấu hình ZaloPay không đầy đủ hoặc bị thiếu trong hệ thống.");
        }

        int appId = int.Parse(appIdStr);

        // 2. Chuyển đổi số tiền USD sang VND (ZaloPay yêu cầu thanh toán bằng VND)
        decimal vndAmount = CurrencyConverter.ConvertUsdToVnd(amount);
        long paymentAmount = (long)vndAmount;

        // 3. Khởi tạo các tham số ZaloPay
        long appTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        // Định dạng app_trans_id: yyMMdd_bookingId_HHmmss đảm bảo tính độc nhất và tuân thủ quy tắc ZaloPay (Max 40 kí tự)
        string appTransId = $"{DateTime.UtcNow:yyMMdd}_{bookingId}_{DateTime.UtcNow:HHmmss}";
        string appUser = "WanderVNUser";
        string item = "[]";
        
        // Nhúng URL Redirect quay về Frontend sau khi thanh toán thành công
        var embedDataObj = new { redirecturl = redirectUrl ?? "http://localhost:5173/payment/zalopay-return" };
        string embedData = JsonSerializer.Serialize(embedDataObj);
        string description = $"Thanh toan don hang WanderVN #{bookingId}";

        // 4. Tạo chữ ký bảo mật (mac)
        // Công thức ghép chuỗi: app_id + "|" + app_trans_id + "|" + app_user + "|" + amount + "|" + app_time + "|" + embed_data + "|" + item
        string rawSignatureData = $"{appId}|{appTransId}|{appUser}|{paymentAmount}|{appTime}|{embedData}|{item}";
        string mac = ComputeHmacSha256(rawSignatureData, key1);

        // 5. Chuẩn bị payload gửi lên ZaloPay
        var requestPayload = new Dictionary<string, object>
        {
            { "app_id", appId },
            { "app_user", appUser },
            { "app_trans_id", appTransId },
            { "app_time", appTime },
            { "amount", paymentAmount },
            { "item", item },
            { "embed_data", embedData },
            { "description", description },
            { "callback_url", callbackUrl ?? "" },
            { "mac", mac }
        };

        // 6. Thực hiện gửi yêu cầu POST đến ZaloPay Server
        var response = await _httpClient.PostAsJsonAsync(baseUrl, requestPayload);
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Không thể kết nối tới ZaloPay Server. HTTP Status: {response.StatusCode}");
        }

        var zaloResponse = await response.Content.ReadFromJsonAsync<ZaloPayCreateOrderResponse>();
        if (zaloResponse == null)
        {
            throw new Exception("Không thể đọc phản hồi từ cổng thanh toán ZaloPay.");
        }

        // return_code = 1 biểu thị tạo đơn hàng thành công trên ZaloPay
        if (zaloResponse.return_code != 1)
        {
            throw new Exception($"Lỗi khởi tạo giao dịch ZaloPay: {zaloResponse.return_message} (Mã lỗi: {zaloResponse.sub_return_code})");
        }

        return zaloResponse.order_url;
    }

    /// <summary>
    /// Xác thực chữ ký Callback (IPN) do ZaloPay gửi về.
    /// </summary>
    public bool ValidateSignature(string data, string reqMac)
    {
        var key2 = _configuration["ZaloPay:Key2"];
        if (string.IsNullOrEmpty(key2))
        {
            return false;
        }

        // ZaloPay sử dụng Key2 để ký dữ liệu callback phản hồi
        string calculatedMac = ComputeHmacSha256(data, key2);

        return string.Equals(calculatedMac, reqMac, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Thuật toán băm HMAC-SHA256 tạo chuỗi mã hóa bảo mật.
    /// </summary>
    private static string ComputeHmacSha256(string message, string key)
    {
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] messageBytes = Encoding.UTF8.GetBytes(message);

        using var hmac = new HMACSHA256(keyBytes);
        byte[] hashBytes = hmac.ComputeHash(messageBytes);
        
        var hexStringBuilder = new StringBuilder(hashBytes.Length * 2);
        foreach (byte b in hashBytes)
        {
            hexStringBuilder.AppendFormat("{0:x2}", b);
        }
        return hexStringBuilder.ToString();
    }
}

/// <summary>
/// Lớp DTO phản hồi nội bộ từ ZaloPay khi tạo đơn hàng.
/// </summary>
internal class ZaloPayCreateOrderResponse
{
    public int return_code { get; set; }
    public string return_message { get; set; } = null!;
    public int sub_return_code { get; set; }
    public string sub_return_message { get; set; } = null!;
    public string order_url { get; set; } = null!;
    public string zp_trans_token { get; set; } = null!;
}
