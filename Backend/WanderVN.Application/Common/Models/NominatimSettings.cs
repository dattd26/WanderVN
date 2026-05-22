namespace WanderVN.Application.Common.Models;

/// <summary>
/// Cấu hình giao tiếp với dịch vụ geocoding miễn phí Nominatim (OpenStreetMap).
/// </summary>
public class NominatimSettings
{
    public string BaseUrl { get; set; } = "https://nominatim.openstreetmap.org/";

    /// <summary>
    /// User-Agent BẮT BUỘC theo TOS của Nominatim. Format: AppName/Version (contact).
    /// </summary>
    public string UserAgent { get; set; } = "WanderVN/1.0 (dev@wandervn.local)";
}
