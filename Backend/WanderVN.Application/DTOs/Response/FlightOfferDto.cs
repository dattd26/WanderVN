using System;
using System.Collections.Generic;

namespace WanderVN.Application.DTOs.Response;

public class FlightOfferPassengerDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // adult, child, infant_without_seat
}

/// <summary>
/// DTO tối giản đại diện cho một ưu đãi chuyến bay trả về từ C# Backend.
/// Giảm thiểu kích thước dữ liệu truyền qua mạng từ 5MB xuống chỉ còn dưới 10KB.
/// </summary>
public class FlightOfferDto
{
    public string Id { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }

    public string TotalCurrency { get; set; } = "USD";

    public string Duration { get; set; } = string.Empty;

    // Mã IATA điểm khởi hành (ví dụ: HAN)
    public string OriginCode { get; set; } = string.Empty;

    // Tên đầy đủ của sân bay đi
    public string OriginName { get; set; } = string.Empty;

    // Mã IATA điểm hạ cánh (ví dụ: SGN)
    public string DestinationCode { get; set; } = string.Empty;

    // Tên đầy đủ của sân bay đến
    public string DestinationName { get; set; } = string.Empty;

    // Thời gian cất cánh
    public DateTime DepartingAt { get; set; }

    // Thời gian hạ cánh
    public DateTime ArrivingAt { get; set; }

    // Mã hãng hàng không (ví dụ: VN, VJ)
    public string CarrierCode { get; set; } = string.Empty;

    // Tên hãng hàng không (ví dụ: Vietnam Airlines)
    public string CarrierName { get; set; } = string.Empty;

    // Đường dẫn Logo đại diện hãng hàng không thương gia
    public string CarrierLogoUrl { get; set; } = string.Empty;

    // Tên dòng máy bay vận hành (ví dụ: Airbus A350)
    public string AircraftName { get; set; } = string.Empty;

    // ID của ưu đãi Duffel Airways chuyên dùng để đặt vé sandbox thành công 100%
    public string DuffelAirwaysOfferId { get; set; } = string.Empty;

    // Danh sách hành khách đi kèm (chứa ID và loại hành khách từ Duffel)
    public List<FlightOfferPassengerDto> Passengers { get; set; } = new();

    // Danh sách hành khách Duffel Airways sandbox tương ứng
    public List<FlightOfferPassengerDto> DuffelAirwaysPassengers { get; set; } = new();
}
