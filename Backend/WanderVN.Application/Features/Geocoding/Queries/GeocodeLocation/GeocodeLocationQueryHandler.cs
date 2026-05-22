using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Geocoding.Queries.GeocodeLocation;

/// <summary>
/// Handler cho GeocodeLocationQuery — kết hợp cache (DB) và gọi Nominatim khi cần.
/// Flow:
///   1. Đọc Location từ DB thông qua Repository.
///   2. Nếu đã có Latitude/Longitude → trả về luôn (không gọi external API).
///   3. Nếu chưa → gọi Nominatim với tên location, UPSERT kết quả vào DB.
/// </summary>
public class GeocodeLocationQueryHandler : IRequestHandler<GeocodeLocationQuery, GeocodeLocationDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGeocodingService _geocodingService;

    public GeocodeLocationQueryHandler(IUnitOfWork unitOfWork, IGeocodingService geocodingService)
    {
        _unitOfWork = unitOfWork;
        _geocodingService = geocodingService;
    }

    public async Task<GeocodeLocationDto?> Handle(GeocodeLocationQuery request, CancellationToken cancellationToken)
    {
        var locationRepository = _unitOfWork.Repository<Locations>();
        
        var location = await locationRepository.FindFirstOrDefaultAsync(
            l => l.Id == request.LocationId,
            cancellationToken: cancellationToken);

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
        
        locationRepository.Update(location);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new GeocodeLocationDto
        {
            Latitude = geo.Latitude,
            Longitude = geo.Longitude
        };
    }
}
