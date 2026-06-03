using System;
using System.Collections.Generic;

namespace WanderVN.Application.DTOs.Response;

public class BookingHistoryDto
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    
    // Loại dịch vụ: "Hotel" hoặc "Flight"
    public string ServiceType { get; set; } = string.Empty;

    public HotelBookingHistoryDetailDto? HotelDetails { get; set; }
    public FlightBookingHistoryDetailDto? FlightDetails { get; set; }
}

public class HotelBookingHistoryDetailDto
{
    public int HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public string HotelAddress { get; set; } = string.Empty;
    public string HotelImage { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public string CheckInDate { get; set; } = string.Empty; // Định dạng yyyy-MM-dd
    public string CheckOutDate { get; set; } = string.Empty; // Định dạng yyyy-MM-dd
}

public class FlightBookingHistoryDetailDto
{
    public string AirlineName { get; set; } = string.Empty;
    public string AirlineLogo { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string DepAirportCode { get; set; } = string.Empty;
    public string ArrAirportCode { get; set; } = string.Empty;
    public string DepAirportCity { get; set; } = string.Empty;
    public string ArrAirportCity { get; set; } = string.Empty;
    public string DepTime { get; set; } = string.Empty; // Định dạng yyyy-MM-dd HH:mm
    public string ArrTime { get; set; } = string.Empty; // Định dạng yyyy-MM-dd HH:mm
    
    // Danh sách hành khách đi kèm (dùng cho chi tiết đặt vé máy bay)
    public List<FlightPassengerInfoDto>? Passengers { get; set; }
}

public class FlightPassengerInfoDto
{
    public string PassengerName { get; set; } = string.Empty;
    public string PassportNumber { get; set; } = string.Empty;
    public string SeatNumber { get; set; } = string.Empty;
}
