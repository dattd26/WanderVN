using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Flights.Queries.GetFlightOfferDetail;

public class GetFlightOfferDetailQuery : IRequest<FlightOfferDetailDto>
{
    public string OfferId { get; set; } = string.Empty;
}
