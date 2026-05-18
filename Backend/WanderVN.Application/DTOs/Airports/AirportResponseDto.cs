namespace WanderVN.Application.DTOs.Airports;

public class AirportResponseDto
{
    public int Id { get; set; }
    public string IataCode { get; set; } = null!;
    public string? Name { get; set; }
    public string? City { get; set; }
}
