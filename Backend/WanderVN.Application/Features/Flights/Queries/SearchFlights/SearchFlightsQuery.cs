using System.Collections.Generic;
using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Flights.Queries.SearchFlights;

/// <summary>
/// DTO Query yêu cầu tìm kiếm chuyến bay.
/// Trả về danh sách FlightOfferDto tinh gọn đã lược bỏ các dữ liệu thừa.
/// </summary>
public class PassengerQueryDto
{
    public string Type { get; set; } = "adult";
}

public class SearchFlightsQuery : IRequest<List<FlightOfferDto>>
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string DepartureDate { get; set; } = string.Empty;
    public int AdultCount { get; set; } = 1;
    public int ChildCount { get; set; } = 0;
    public int InfantCount { get; set; } = 0;
    public List<PassengerQueryDto> Passengers { get; set; } = new();
    public bool ReturnOffers { get; set; } = true;
    public string CabinClass { get; set; } = "business";
    public string ReturnDate { get; set; } = string.Empty;
}
