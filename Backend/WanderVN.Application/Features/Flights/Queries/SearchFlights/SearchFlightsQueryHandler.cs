using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;

namespace WanderVN.Application.Features.Flights.Queries.SearchFlights;

/// <summary>
/// Handler xử lý logic tìm kiếm chuyến bay thông qua việc gọi IDuffelService.
/// </summary>
public class SearchFlightsQueryHandler : IRequestHandler<SearchFlightsQuery, string>
{
    private readonly IDuffelService _duffelService;

    public SearchFlightsQueryHandler(IDuffelService duffelService)
    {
        _duffelService = duffelService;
    }

    public async Task<string> Handle(SearchFlightsQuery request, CancellationToken cancellationToken)
    {
        // Chuyển đổi Query thành DTO của service bao gồm cấu hình return_offers
        var duffelRequest = new DuffelOfferRequestDto
        {
            Origin = request.Origin,
            Destination = request.Destination,
            DepartureDate = request.DepartureDate,
            PassengerType = request.PassengerType,
            ReturnOffers = request.ReturnOffers
        };

        // Gửi yêu cầu qua Service và trả về JSON gốc từ API đối tác
        var responseJson = await _duffelService.SearchOffersAsync(duffelRequest);
        
        return responseJson;
    }
}
