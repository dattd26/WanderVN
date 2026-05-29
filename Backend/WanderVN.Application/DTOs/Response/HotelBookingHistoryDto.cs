using System;

namespace WanderVN.Application.DTOs.Response;

public class HotelBookingHistoryDto
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public int HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public string HotelAddress { get; set; } = string.Empty;
    public string HotelImage { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public string CheckInDate { get; set; } = string.Empty;  // Định dạng yyyy-MM-dd
    public string CheckOutDate { get; set; } = string.Empty; // Định dạng yyyy-MM-dd
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;       // Pending, Confirmed, Completed, Cancelled
    public DateTimeOffset CreatedAt { get; set; }
}