using MediatR;

namespace WanderVN.Application.Features.Geocoding.Queries.GeocodeLocation;

/// <summary>
/// Query lấy tọa độ lat/lng của một Location. Backend sẽ ưu tiên trả về tọa độ đã cache trong DB,
/// chỉ gọi Nominatim API khi DB chưa có (và lưu lại cho lần sau).
/// </summary>
public class GeocodeLocationQuery : IRequest<GeocodeLocationDto?>
{
    public int LocationId { get; set; }

    public GeocodeLocationQuery() { }

    public GeocodeLocationQuery(int locationId)
    {
        LocationId = locationId;
    }
}
