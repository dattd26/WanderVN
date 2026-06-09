using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Flights.Queries.GetAirports;

public class GetAirportsQueryHandler : IRequestHandler<GetAirportsQuery, List<AirportDto>>
{
    private readonly IAirportRepository _repository;

    public GetAirportsQueryHandler(IAirportRepository repository)
    {
        _repository = repository;
    }

    public Task<List<AirportDto>> Handle(GetAirportsQuery request, CancellationToken cancellationToken)
    {
        return _repository.SearchAirportsAsync(request.Keyword, cancellationToken);
    }
}
