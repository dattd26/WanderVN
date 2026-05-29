using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;

namespace WanderVN.Infrastructure.Services;

/// <summary>
/// Triển khai dịch vụ giao tiếp với Duffel API.
/// </summary>
public class DuffelService : IDuffelService
{
    private readonly HttpClient _httpClient;

    public DuffelService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> SearchOffersAsync(DuffelOfferRequestDto request)
    {
        var isRoundTrip = !string.IsNullOrEmpty(request.ReturnDate);
        var cabinClass = string.IsNullOrEmpty(request.CabinClass) ? "business" : request.CabinClass;

        object payload;
        if (isRoundTrip)
        {
            payload = new
            {
                data = new
                {
                    slices = new[]
                    {
                        new { origin = request.Origin, destination = request.Destination, departure_date = request.DepartureDate },
                        new { origin = request.Destination, destination = request.Origin, departure_date = request.ReturnDate }
                    },
                    passengers = new[] { new { type = request.PassengerType } },
                    cabin_class = cabinClass,
                    return_offers = request.ReturnOffers
                }
            };
        }
        else
        {
            payload = new
            {
                data = new
                {
                    slices = new[]
                    {
                        new { origin = request.Origin, destination = request.Destination, departure_date = request.DepartureDate }
                    },
                    passengers = new[] { new { type = request.PassengerType } },
                    cabin_class = cabinClass,
                    return_offers = request.ReturnOffers
                }
            };
        }

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("air/offer_requests", content);
        
        // Ném lỗi nếu response status code không thành công
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> CreateOrderAsync(DuffelOrderRequestDto request)
    {
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("air/orders", content);
        
        if (!response.IsSuccessStatusCode)
        {
            // Đọc nội dung lỗi chi tiết từ Duffel API để hỗ trợ debug
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Duffel API returned {(int)response.StatusCode} {response.ReasonPhrase}. Chi tiết lỗi: {errorBody}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> GetOfferAsync(string offerId)
    {
        var response = await _httpClient.GetAsync($"air/offers/{offerId}");
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Duffel API returned {(int)response.StatusCode} {response.ReasonPhrase}. Chi tiết lỗi: {errorBody}");
        }

        return await response.Content.ReadAsStringAsync();
    }
}
