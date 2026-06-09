using System.Collections.Generic;
using MediatR;

namespace WanderVN.Application.Features.Flights.Queries.GetAirports;

public class GetAirportsQuery : IRequest<List<AirportDto>>
{
    public string? Keyword { get; set; }
}

public class AirportDto
{
    public string IataCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string City { get; set; } = null!;
}
