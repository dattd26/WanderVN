namespace WanderVN.Application.DTOs.Airports;

public class AirportRequestDto
{
    public string IataCode { get; set; } = null!;
    public string? Name { get; set; }
    public string? City { get; set; }
}
