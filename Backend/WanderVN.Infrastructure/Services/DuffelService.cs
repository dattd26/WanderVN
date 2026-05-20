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
        // Xây dựng payload động dựa trên tham số truyền vào
        var payload = new
        {
            data = new
            {
                slices = new[]
                {
                    new
                    {
                        origin = request.Origin,
                        destination = request.Destination,
                        departure_date = request.DepartureDate
                    }
                },
                passengers = new[]
                {
                    new { type = request.PassengerType }
                },
                return_offers = request.ReturnOffers
            }
        };

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
        
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }
}
