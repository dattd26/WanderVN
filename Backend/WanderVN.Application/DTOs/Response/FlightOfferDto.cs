using System;

namespace WanderVN.Application.DTOs.Response;

/// <summary>
/// DTO tối giản đại diện cho một ưu đãi chuyến bay trả về từ C# Backend.
/// Giảm thiểu kích thước dữ liệu truyền qua mạng từ 5MB xuống chỉ còn dưới 10KB.
/// </summary>
public class FlightOfferDto
{
    // ID của ưu đãi Duffel (ví dụ: off_...) dùng để đặt vé
    public string Id { get; set; } = string.Empty;

    // Tổng chi phí (đã quy đổi/giả lập)
    public decimal TotalAmount { get; set; }

    // Loại tiền tệ sử dụng (ví dụ: USD, VND)
    public string TotalCurrency { get; set; } = "USD";

    // ID hành khách mock tương ứng để gửi yêu cầu đặt vé
    public string PassengerId { get; set; } = string.Empty;

    // Khoảng thời gian bay (được chuẩn hóa)
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
}
