using System.Collections.Generic;

namespace WanderVN.Application.DTOs.Request;

public class DuffelPassengerRequestDto
{
    public string Type { get; set; } = "adult";
}

/// <summary>
/// DTO chứa các tham số cơ bản để tìm kiếm chuyến bay thông qua Duffel API.
/// </summary>
public class DuffelOfferRequestDto
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string DepartureDate { get; set; } = string.Empty;
    public int AdultCount { get; set; } = 1;
    public int ChildCount { get; set; } = 0;
    public int InfantCount { get; set; } = 0;
    public List<DuffelPassengerRequestDto> Passengers { get; set; } = new();
    public bool ReturnOffers { get; set; } = true;
    public string CabinClass { get; set; } = "business";
    public string ReturnDate { get; set; } = string.Empty;
}
