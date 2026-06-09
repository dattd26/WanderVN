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

        var passengersList = new System.Collections.Generic.List<object>();
        if (request.Passengers != null && request.Passengers.Count > 0)
        {
            foreach (var p in request.Passengers)
            {
                passengersList.Add(new { type = p.Type });
            }
        }
        else
        {
            for (int i = 0; i < request.AdultCount; i++) passengersList.Add(new { type = "adult" });
            for (int i = 0; i < request.ChildCount; i++) passengersList.Add(new { type = "child" });
            for (int i = 0; i < request.InfantCount; i++) passengersList.Add(new { type = "infant_without_seat" });
        }
        if (passengersList.Count == 0) passengersList.Add(new { type = "adult" });

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
                    passengers = passengersList,
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
                    passengers = passengersList,
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

    public async Task<string> PayOrderAsync(string orderId, string paymentAmount, string paymentCurrency)
    {
        var payload = new
        {
            data = new
            {
                order_id = orderId,
                payment = new
                {
                    type = "balance",
                    amount = paymentAmount,
                    currency = paymentCurrency
                }
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("air/payments", content);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Duffel API returned {(int)response.StatusCode} {response.ReasonPhrase}. Chi tiết lỗi: {errorBody}");
        }

        return await response.Content.ReadAsStringAsync();
    }
}
