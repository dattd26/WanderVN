using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Interface cho dịch vụ cache kết quả tìm kiếm chuyến bay.
/// Hỗ trợ lưu trữ và truy vấn cache dựa trên yêu cầu tìm kiếm của Duffel.
/// </summary>
public interface IFlightSearchCacheService
{
    Task<List<FlightOfferDto>?> GetAsync(DuffelOfferRequestDto request, CancellationToken cancellationToken = default);

    Task SetAsync(
        DuffelOfferRequestDto request,
        IReadOnlyCollection<FlightOfferDto> offers,
        string duffelResponseJson,
        CancellationToken cancellationToken = default);
}
