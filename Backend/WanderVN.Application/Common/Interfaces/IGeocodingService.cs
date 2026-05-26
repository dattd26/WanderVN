using System.Threading;
using System.Threading.Tasks;

namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Kết quả geocoding (chuyển tên địa danh thành tọa độ địa lý).
/// </summary>
public record GeocodingResult(decimal Latitude, decimal Longitude);

/// <summary>
/// Interface giao tiếp với dịch vụ geocoding bên ngoài (Nominatim/OpenStreetMap).
/// </summary>
public interface IGeocodingService
{
    /// <summary>
    /// Chuyển một chuỗi truy vấn (ví dụ "Đà Nẵng, Việt Nam") thành tọa độ lat/lng.
    /// Trả về null nếu không tìm thấy kết quả phù hợp.
    /// </summary>
    Task<GeocodingResult?> GeocodeAsync(string query, CancellationToken cancellationToken);
}
