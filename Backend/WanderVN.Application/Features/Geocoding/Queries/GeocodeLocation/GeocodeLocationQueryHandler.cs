using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Geocoding.Queries.GeocodeLocation;

/// <summary>
/// Handler cho GeocodeLocationQuery — kết hợp cache (DB) và gọi Nominatim khi cần.
/// Flow:
///   1. Đọc Location từ DB.
///   2. Nếu đã có Latitude/Longitude → trả về luôn (không gọi external API).
///   3. Nếu chưa → gọi Nominatim với tên location, UPSERT kết quả vào DB.
/// </summary>
public class GeocodeLocationQueryHandler : IRequestHandler<GeocodeLocationQuery, GeocodeLocationDto?>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IGeocodingService _geocodingService;

    public GeocodeLocationQueryHandler(IApplicationDbContext dbContext, IGeocodingService geocodingService)
    {
        _dbContext = dbContext;
        _geocodingService = geocodingService;
    }

    public async Task<GeocodeLocationDto?> Handle(GeocodeLocationQuery request, CancellationToken cancellationToken)
    {
        var location = await _dbContext.Locations
            .FirstOrDefaultAsync(l => l.Id == request.LocationId, cancellationToken);

        if (location == null)
        {
            return null;
        }

        // Cache hit: tọa độ đã có trong DB
        if (location.Latitude.HasValue && location.Longitude.HasValue)
        {
            return new GeocodeLocationDto
            {
                Latitude = location.Latitude.Value,
                Longitude = location.Longitude.Value
            };
        }

        // Cache miss: gọi Nominatim. Bổ sung ", Vietnam" để cải thiện độ chính xác cho địa danh trùng tên toàn cầu.
        var query = $"{location.Name}, Vietnam";
        var geo = await _geocodingService.GeocodeAsync(query, cancellationToken);
        if (geo == null)
        {
            return null;
        }

        location.Latitude = geo.Latitude;
        location.Longitude = geo.Longitude;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new GeocodeLocationDto
        {
            Latitude = geo.Latitude,
            Longitude = geo.Longitude
        };
    }
}
