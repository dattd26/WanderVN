using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Models;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Infrastructure.Services;

public class FlightSearchCacheService : IFlightSearchCacheService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IDistributedCache _cache;
    private readonly FlightSearchCacheSettings _settings;
    private readonly ILogger<FlightSearchCacheService> _logger;

    public FlightSearchCacheService(
        IDistributedCache cache,
        IOptions<FlightSearchCacheSettings> settings,
        ILogger<FlightSearchCacheService> logger)
    {
        _cache = cache;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<List<FlightOfferDto>?> GetAsync(DuffelOfferRequestDto request, CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled) return null;

        var key = BuildKey(request);

        try
        {
            var cachedJson = await _cache.GetStringAsync(key, cancellationToken);
            if (string.IsNullOrWhiteSpace(cachedJson))
            {
                _logger.LogDebug("Flight search cache miss for {CacheKey}", key);
                return null;
            }

            var offers = JsonSerializer.Deserialize<List<FlightOfferDto>>(cachedJson, JsonOptions);
            _logger.LogInformation("Flight search cache hit for {CacheKey}", key);
            return offers;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Flight search cache read failed. Falling back to Duffel.");
            return null;
        }
    }

    public async Task SetAsync(
        DuffelOfferRequestDto request,
        IReadOnlyCollection<FlightOfferDto> offers,
        string duffelResponseJson,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled) return;

        var ttl = CalculateTtl(duffelResponseJson, offers.Count);
        if (ttl <= TimeSpan.Zero)
        {
            _logger.LogDebug("Flight search cache skipped because TTL was not positive.");
            return;
        }

        var key = BuildKey(request);

        try
        {
            var cachedJson = JsonSerializer.Serialize(offers, JsonOptions);
            await _cache.SetStringAsync(
                key,
                cachedJson,
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl },
                cancellationToken);

            _logger.LogInformation("Flight search cache stored for {CacheKey} with TTL {TtlSeconds}s", key, (int)ttl.TotalSeconds);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Flight search cache write failed. Search response will still be returned.");
        }
    }

    private string BuildKey(DuffelOfferRequestDto request)
    {
        var canonical = string.Join('|',
            NormalizeCode(request.Origin),
            NormalizeCode(request.Destination),
            NormalizeDate(request.DepartureDate),
            NormalizeDate(request.ReturnDate),
            NormalizeLower(request.PassengerType, "adult"),
            NormalizeLower(request.CabinClass, "business"),
            request.ReturnOffers ? "true" : "false");

        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonical))).ToLowerInvariant();
        return $"{_settings.KeyPrefix}:{hash}";
    }

    private TimeSpan CalculateTtl(string duffelResponseJson, int offerCount)
    {
        if (offerCount == 0)
        {
            return TimeSpan.FromMinutes(Math.Max(1, _settings.EmptyResultTtlMinutes));
        }

        var maxTtl = TimeSpan.FromMinutes(Math.Max(1, _settings.MaxTtlMinutes));
        var fallbackTtl = TimeSpan.FromMinutes(Math.Max(1, _settings.FallbackTtlMinutes));
        var safetyBuffer = TimeSpan.FromSeconds(Math.Max(0, _settings.ExpirySafetyBufferSeconds));
        var earliestExpiry = TryGetEarliestOfferExpiry(duffelResponseJson);

        if (earliestExpiry is null)
        {
            return fallbackTtl < maxTtl ? fallbackTtl : maxTtl;
        }

        var ttlFromDuffel = earliestExpiry.Value - DateTimeOffset.UtcNow - safetyBuffer;
        return ttlFromDuffel < maxTtl ? ttlFromDuffel : maxTtl;
    }

    private static DateTimeOffset? TryGetEarliestOfferExpiry(string duffelResponseJson)
    {
        if (string.IsNullOrWhiteSpace(duffelResponseJson)) return null;

        try
        {
            using var document = JsonDocument.Parse(duffelResponseJson);
            if (!document.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Object) return null;
            if (!data.TryGetProperty("offers", out var offers) || offers.ValueKind != JsonValueKind.Array) return null;

            DateTimeOffset? earliest = null;
            foreach (var offer in offers.EnumerateArray())
            {
                if (offer.ValueKind != JsonValueKind.Object) continue;
                if (!offer.TryGetProperty("expires_at", out var expiresAt) || expiresAt.ValueKind != JsonValueKind.String) continue;
                if (!DateTimeOffset.TryParse(expiresAt.GetString(), out var parsedExpiry)) continue;

                if (earliest is null || parsedExpiry < earliest.Value)
                {
                    earliest = parsedExpiry;
                }
            }

            return earliest;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string NormalizeCode(string value) => (value ?? string.Empty).Trim().ToUpperInvariant();

    private static string NormalizeLower(string value, string fallback)
    {
        var normalized = (value ?? string.Empty).Trim().ToLowerInvariant();
        return string.IsNullOrEmpty(normalized) ? fallback : normalized;
    }

    private static string NormalizeDate(string value)
    {
        var normalized = (value ?? string.Empty).Trim();
        return DateOnly.TryParse(normalized, out var parsedDate)
            ? parsedDate.ToString("yyyy-MM-dd")
            : normalized;
    }
}
