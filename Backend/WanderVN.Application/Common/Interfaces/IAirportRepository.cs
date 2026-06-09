using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.Features.Flights.Queries.GetAirports;

namespace WanderVN.Application.Common.Interfaces;

public interface IAirportRepository
{
    Task<List<AirportDto>> SearchAirportsAsync(string? keyword, CancellationToken cancellationToken);
}
