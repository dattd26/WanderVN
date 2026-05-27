namespace WanderVN.Application.DTOs.Response;

public class ChatbotResponse
{
    public int? Id { get; set; }
    public string? Reply { get; set; }
    public DateTime? Timestamp { get; set; }
    public List<HotelSuggestion>? HotelSuggestions { get; set; }
    public string? FlightSearchUrl { get; set; }
}

public class HotelSuggestion
{
    public int HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int? StarRating { get; set; }
    public decimal? Price { get; set; }
    public string? Reason { get; set; }
}
