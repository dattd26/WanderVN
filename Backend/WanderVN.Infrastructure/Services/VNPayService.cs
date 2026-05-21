using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Infrastructure.Services;

/// <summary>
/// Thực thi dịch vụ tích hợp cổng thanh toán VNPay.
/// </summary>
public class VNPayService : IVNPayService
{
    private readonly IConfiguration _configuration;

    public VNPayService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Tạo URL thanh toán VNPay dựa trên thông tin hóa đơn và IP của khách hàng.
    /// </summary>
    public string CreatePaymentUrl(int bookingId, decimal amount, string ipAddress)
    {
        var vnp_TmnCode = _configuration["VNPay:TmnCode"];
        var vnp_HashSecret = _configuration["VNPay:HashSecret"];
        var vnp_BaseUrl = _configuration["VNPay:BaseUrl"];
        var vnp_ReturnUrl = _configuration["VNPay:ReturnUrl"];

        if (string.IsNullOrEmpty(vnp_TmnCode) || string.IsNullOrEmpty(vnp_HashSecret) || string.IsNullOrEmpty(vnp_BaseUrl))
        {
            throw new InvalidOperationException("Cấu hình VNPay không hợp lệ hoặc bị thiếu.");
        }

        // Chuyển đổi số tiền từ USD sang VND bằng bộ công cụ chuyển đổi để tránh lỗi giao dịch không hợp lệ
        decimal vndAmount = WanderVN.Application.Common.Utils.CurrencyConverter.ConvertUsdToVnd(amount);

        // VNPay yêu cầu số tiền nhân với 100 và chuyển thành chuỗi số nguyên
        long paymentAmount = (long)(vndAmount * 100);

        // Tạo danh sách tham số gửi sang VNPay
        var vnpayData = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            { "vnp_Version", "2.1.0" },
            { "vnp_Command", "pay" },
            { "vnp_TmnCode", vnp_TmnCode },
            { "vnp_Amount", paymentAmount.ToString() },
            { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
            { "vnp_CurrCode", "VND" },
            { "vnp_IpAddr", ipAddress },
            { "vnp_Locale", "vn" },
            { "vnp_OrderInfo", $"Thanh toan don hang #{bookingId}" },
            { "vnp_OrderType", "other" },
            { "vnp_ReturnUrl", vnp_ReturnUrl ?? "" },
            // Tránh lỗi trùng mã giao dịch khi thanh toán lại: dùng format "BookingId_Ticks"
            { "vnp_TxnRef", $"{bookingId}_{DateTime.UtcNow.Ticks}" }
        };

        // Tạo chuỗi truy vấn (query string) để băm dữ liệu
        var rawData = new StringBuilder();
        var query = new StringBuilder();

        foreach (var kvp in vnpayData)
        {
            if (!string.IsNullOrEmpty(kvp.Value))
            {
                rawData.Append(WebUtility.UrlEncode(kvp.Key));
                rawData.Append('=');
                rawData.Append(WebUtility.UrlEncode(kvp.Value));
                rawData.Append('&');

                query.Append(WebUtility.UrlEncode(kvp.Key));
                query.Append('=');
                query.Append(WebUtility.UrlEncode(kvp.Value));
                query.Append('&');
            }
        }

        // Loại bỏ ký tự '&' cuối cùng
        if (rawData.Length > 0)
        {
            rawData.Remove(rawData.Length - 1, 1);
            query.Remove(query.Length - 1, 1);
        }

        // Tạo mã chữ ký bảo mật vnp_SecureHash
        string secureHash = HmacSHA512(vnp_HashSecret, rawData.ToString());

        // Ghép thêm SecureHash vào chuỗi URL
        string paymentUrl = $"{vnp_BaseUrl}?{query}&vnp_SecureHash={secureHash}";

        return paymentUrl;
    }

    /// <summary>
    /// Xác thực chữ ký phản hồi (SecureHash) nhận được từ VNPay.
    /// </summary>
    public bool ValidateSignature(IDictionary<string, string> queryParameters)
    {
        var vnp_HashSecret = _configuration["VNPay:HashSecret"];
        if (string.IsNullOrEmpty(vnp_HashSecret))
        {
            return false;
        }

        string? vnp_SecureHash = null;
        var rawData = new StringBuilder();

        // Sắp xếp các tham số nhận được theo thứ tự alphabet
        var sortedParams = new SortedDictionary<string, string>(queryParameters, StringComparer.Ordinal);

        foreach (var kvp in sortedParams)
        {
            if (kvp.Key == "vnp_SecureHash")
            {
                vnp_SecureHash = kvp.Value;
                continue;
            }

            // Bỏ qua các tham số rỗng hoặc tham số không thuộc VNPay signature
            if (kvp.Key.StartsWith("vnp_") && !string.IsNullOrEmpty(kvp.Value))
            {
                rawData.Append(WebUtility.UrlEncode(kvp.Key));
                rawData.Append('=');
                rawData.Append(WebUtility.UrlEncode(kvp.Value));
                rawData.Append('&');
            }
        }

        if (rawData.Length > 0)
        {
            rawData.Remove(rawData.Length - 1, 1); // xoa & cuoi cung
        }

        if (string.IsNullOrEmpty(vnp_SecureHash))
        {
            return false;
        }

        // Tính toán chữ ký từ dữ liệu nhận được để đối chiếu
        string calculatedHash = HmacSHA512(vnp_HashSecret, rawData.ToString());

        // check xem hash từ query parameters từ VNPay gửi(IPN - server to server) 
        // có trùng với hash với secret key của mình không
        // So sánh không phân biệt chữ hoa chữ thường
        return string.Equals(calculatedHash, vnp_SecureHash, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Hàm mã hóa HMAC-SHA512 để tạo chuỗi băm bảo mật.
    /// </summary>
    private static string HmacSHA512(string key, string inputData)
    {
        var hash = new StringBuilder();
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
        using (var hmac = new HMACSHA512(keyBytes))
        {
            byte[] hashValue = hmac.ComputeHash(inputBytes);
            foreach (var theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }
        }
        return hash.ToString();
    }
}
