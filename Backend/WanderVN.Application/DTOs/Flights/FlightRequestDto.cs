namespace WanderVN.Application.DTOs.Flights;

public class FlightRequestDto
{
    public int? AirlineId { get; set; }
    public string FlightNumber { get; set; } = null!;
    public int? DepAirportId { get; set; }
    public int? ArrAirportId { get; set; }
    public DateTime DepTime { get; set; }
    public DateTime ArrTime { get; set; }
    public decimal Price { get; set; }
    public string? Status { get; set; }
}
