namespace WanderVN.Application.DTOs.Response;

public class BookingLookupDetailDto
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;

    public string? HotelName { get; set; }
    public string? HotelAddress { get; set; }
    public string? HotelImage { get; set; }
    public string? RoomTypeName { get; set; }
    public string? CheckInDate { get; set; }
    public string? CheckOutDate { get; set; }

    public string? PassengerNames { get; set; }
}
