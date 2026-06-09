using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace WanderVN.Application.DTOs.Request;

public class DuffelOrderRequestDto
{
    [JsonPropertyName("data")]
    public DuffelOrderDataDto Data { get; set; } = new();
}

public class DuffelOrderDataDto
{
    // Loại đặt vé: "instant" (đặt ngay và xuất vé) hoặc "hold" (giữ chỗ)
    [JsonPropertyName("type")]
    public string Type { get; set; } = "instant";

    [JsonPropertyName("selected_offers")]
    public List<string> SelectedOffers { get; set; } = new();

    [JsonPropertyName("passengers")]
    public List<DuffelPassengerDto> Passengers { get; set; } = new();

    // Thông tin thanh toán (bắt buộc khi chọn type là "instant")
    [JsonPropertyName("payments")]
    public List<DuffelPaymentDto>? Payments { get; set; }
}

public class DuffelPassengerDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("family_name")]
    public string FamilyName { get; set; } = string.Empty;

    [JsonPropertyName("given_name")]
    public string GivenName { get; set; } = string.Empty;

    [JsonPropertyName("born_on")]
    public string BornOn { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("phone_number")]
    public string PhoneNumber { get; set; } = string.Empty;

    [JsonPropertyName("gender")]
    public string Gender { get; set; } = string.Empty;

    [JsonPropertyName("infant_passenger_id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? InfantPassengerId { get; set; }
}

public class DuffelPaymentDto
{
    // Phương thức thanh toán, mặc định dùng số dư ví Duffel "balance"
    [JsonPropertyName("type")]
    public string Type { get; set; } = "balance";

    [JsonPropertyName("amount")]
    public string Amount { get; set; } = string.Empty;

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "USD";
}
