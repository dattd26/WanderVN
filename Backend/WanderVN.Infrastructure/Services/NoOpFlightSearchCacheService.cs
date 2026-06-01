using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Infrastructure.Services;

public class NoOpFlightSearchCacheService : IFlightSearchCacheService
{
    public Task<List<FlightOfferDto>?> GetAsync(DuffelOfferRequestDto request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult<List<FlightOfferDto>?>(null);
    }

    public Task SetAsync(
        DuffelOfferRequestDto request,
        IReadOnlyCollection<FlightOfferDto> offers,
        string duffelResponseJson,
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}
