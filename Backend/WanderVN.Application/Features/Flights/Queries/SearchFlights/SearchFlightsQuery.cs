using MediatR;

namespace WanderVN.Application.Features.Flights.Queries.SearchFlights;

/// <summary>
/// DTO Query yêu cầu tìm kiếm chuyến bay.
/// Trả về chuỗi JSON thô từ Duffel API chứa danh sách Offers.
/// </summary>
public class SearchFlightsQuery : IRequest<string>
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string DepartureDate { get; set; } = string.Empty;
    public string PassengerType { get; set; } = "adult";
    public bool ReturnOffers { get; set; } = true;
}
