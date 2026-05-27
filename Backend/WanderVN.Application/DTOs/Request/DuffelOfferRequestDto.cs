namespace WanderVN.Application.DTOs.Request;

/// <summary>
/// DTO chứa các tham số cơ bản để tìm kiếm chuyến bay thông qua Duffel API.
/// </summary>
public class DuffelOfferRequestDto
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string DepartureDate { get; set; } = string.Empty;
    public string PassengerType { get; set; } = "adult";
    public bool ReturnOffers { get; set; } = true;
    public string CabinClass { get; set; } = "business";
    public string ReturnDate { get; set; } = string.Empty;
}
