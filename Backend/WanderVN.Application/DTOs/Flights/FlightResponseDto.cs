using WanderVN.Application.DTOs.Airlines;
using WanderVN.Application.DTOs.Airports;

namespace WanderVN.Application.DTOs.Flights;

public class FlightResponseDto
{
    public int Id { get; set; }
    public int? AirlineId { get; set; }
    public string FlightNumber { get; set; } = null!;
    public int? DepAirportId { get; set; }
    public int? ArrAirportId { get; set; }
    public DateTime DepTime { get; set; }
    public DateTime ArrTime { get; set; }
    public decimal Price { get; set; }
    public string? Status { get; set; }
    public AirlineResponseDto? Airline { get; set; }
    public AirportResponseDto? DepAirport { get; set; }
    public AirportResponseDto? ArrAirport { get; set; }
}
