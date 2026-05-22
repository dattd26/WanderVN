using System;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Infrastructure.Services;

/// <summary>
/// Triển khai IGeocodingService bằng cách gọi Nominatim API (miễn phí, OpenStreetMap).
/// Lưu ý TOS: tối đa 1 req/sec, BẮT BUỘC có User-Agent định danh, KHÔNG bulk geocoding.
/// </summary>
public class NominatimGeocodingService : IGeocodingService
{
    private readonly HttpClient _httpClient;

    public NominatimGeocodingService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<GeocodingResult?> GeocodeAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return null;
        }

        var encoded = Uri.EscapeDataString(query);
        var url = $"search?q={encoded}&format=json&limit=1";

        using var response = await _httpClient.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        var first = document.RootElement.EnumerateArray().FirstOrDefault();
        if (first.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        // Nominatim trả lat/lon dưới dạng string trong JSON
        if (!first.TryGetProperty("lat", out var latProp) || !first.TryGetProperty("lon", out var lonProp))
        {
            return null;
        }

        var latStr = latProp.GetString();
        var lonStr = lonProp.GetString();

        if (!decimal.TryParse(latStr, NumberStyles.Float, CultureInfo.InvariantCulture, out var lat) ||
            !decimal.TryParse(lonStr, NumberStyles.Float, CultureInfo.InvariantCulture, out var lon))
        {
            return null;
        }

        return new GeocodingResult(lat, lon);
    }
}
