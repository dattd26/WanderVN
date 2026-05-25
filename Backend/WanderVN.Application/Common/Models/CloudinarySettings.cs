namespace WanderVN.Application.Common.Models;

/// <summary>
/// Cấu hình kết nối Cloudinary - lưu trữ media (ảnh khách sạn, phòng, avatar).
/// Đọc từ section "Cloudinary" trong appsettings.{env}.json.
/// </summary>
public class CloudinarySettings
{
    /// <summary>Tên cloud account, ví dụ: "wandervn-prod".</summary>
    public string CloudName { get; set; } = string.Empty;

    /// <summary>API key (public).</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>API secret — KHÔNG commit lên repo, chỉ ở appsettings.Development.json hoặc user-secrets.</summary>
    public string ApiSecret { get; set; } = string.Empty;

    /// <summary>Thư mục mặc định trên Cloudinary để upload ảnh khách sạn. Ví dụ: "wandervn/hotels".</summary>
    public string HotelFolder { get; set; } = "wandervn/hotels";
}
