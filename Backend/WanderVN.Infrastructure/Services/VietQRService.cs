using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Infrastructure.Services;

public class VietQRService : IVietQRService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<VietQRService> _logger;

    public VietQRService(HttpClient httpClient, ILogger<VietQRService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string> GenerateQRCodeAsync(
        string accountNo,
        string accountName,
        int acqId,
        decimal amount,
        string addInfo,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Chuẩn hóa tên chủ tài khoản: Tiếng Việt không dấu, viết hoa, không ký tự đặc biệt
            var normalizedName = RemoveSignAndSpecialChars(accountName).ToUpper();
            // Chuẩn hóa nội dung chuyển khoản: Tiếng Việt không dấu, viết hoa, tối đa 25 ký tự, không ký tự đặc biệt
            var normalizedInfo = RemoveSignAndSpecialChars(addInfo).ToUpper();
            if (normalizedInfo.Length > 25)
            {
                normalizedInfo = normalizedInfo.Substring(0, 25);
            }

            var requestBody = new VietQRGenerateRequest
            {
                AccountNo = accountNo,
                AccountName = normalizedName,
                AcqId = acqId,
                Amount = (long)amount,
                AddInfo = normalizedInfo,
                Format = "text",
                Template = "compact2" // compact2 là mẫu phổ biến hiển thị thông tin chuyển khoản rõ ràng
            };

            var response = await _httpClient.PostAsJsonAsync("v2/generate", requestBody, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<VietQRResponse>(cancellationToken: cancellationToken);
            if (result == null || result.Code != "00" || result.Data == null)
            {
                var errorMsg = result?.Desc ?? "Lỗi phản hồi từ hệ thống VietQR";
                _logger.LogError("VietQR API Error: {ErrorMsg}", errorMsg);
                throw new Exception($"Không thể tạo mã VietQR: {errorMsg}");
            }

            return result.Data.QrDataURL;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating VietQR Code");
            throw;
        }
    }

    private static string RemoveSignAndSpecialChars(string str)
    {
        if (string.IsNullOrEmpty(str)) return string.Empty;

        // Thay thế ký tự tiếng Việt có dấu
        string[] vietnameseSigns = new string[]
        {
            "aAeEoOuUiIdDyY",
            "áàạảãâấầậẩẫăắằặẳẵ",
            "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",
            "éèẹẻẽêếềệểễ",
            "ÉÈẸẺẼÊẾỀỆỂỄ",
            "óòọỏõôốồộổỗơớờợởỡ",
            "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",
            "úùụủũưứừựửữ",
            "ÚÙỤỦŨƯỨỪỰỬỮ",
            "íìịỉĩ",
            "ÍÌỊỈĨ",
            "đ",
            "Đ",
            "ýỳỵỷỹ",
            "ÝỲỴỶỸ"
        };

        for (int i = 1; i < vietnameseSigns.Length; i++)
        {
            for (int j = 0; j < vietnameseSigns[i].Length; j++)
            {
                str = str.Replace(vietnameseSigns[i][j].ToString(), vietnameseSigns[0][i - 1].ToString());
            }
        }

        // Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ, số và khoảng trắng
        str = Regex.Replace(str, @"[^a-zA-Z0-9\s]", "");

        // Thay nhiều khoảng trắng liên tiếp bằng 1 khoảng trắng
        str = Regex.Replace(str, @"\s+", " ").Trim();

        return str;
    }

    private class VietQRGenerateRequest
    {
        [JsonPropertyName("accountNo")]
        public string AccountNo { get; set; } = string.Empty;

        [JsonPropertyName("accountName")]
        public string AccountName { get; set; } = string.Empty;

        [JsonPropertyName("acqId")]
        public int AcqId { get; set; }

        [JsonPropertyName("amount")]
        public long Amount { get; set; }

        [JsonPropertyName("addInfo")]
        public string AddInfo { get; set; } = string.Empty;

        [JsonPropertyName("format")]
        public string Format { get; set; } = "text";

        [JsonPropertyName("template")]
        public string Template { get; set; } = "compact2";
    }

    private class VietQRResponse
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("desc")]
        public string Desc { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public VietQRResponseData? Data { get; set; }
    }

    private class VietQRResponseData
    {
        [JsonPropertyName("qrCode")]
        public string QrCode { get; set; } = string.Empty;

        [JsonPropertyName("qrDataURL")]
        public string QrDataURL { get; set; } = string.Empty;
    }
}
