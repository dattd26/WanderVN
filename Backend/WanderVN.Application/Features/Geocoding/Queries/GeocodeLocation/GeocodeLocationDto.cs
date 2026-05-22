namespace WanderVN.Application.Features.Geocoding.Queries.GeocodeLocation;

/// <summary>
/// Kết quả geocoding cho một Location (Province/District/Area) — dùng để center map ở Frontend.
/// </summary>
public class GeocodeLocationDto
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
}
