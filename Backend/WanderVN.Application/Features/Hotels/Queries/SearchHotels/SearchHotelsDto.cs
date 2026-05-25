namespace WanderVN.Application.Features.Hotels.Queries.SearchHotels;

/// <summary>
/// DTO đại diện cho thông tin khách sạn hiển thị ở kết quả tìm kiếm trang chủ.
/// </summary>
public class SearchHotelsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int StarRating { get; set; }
    public string Description { get; set; } = string.Empty;
    public string LocationName { get; set; } = string.Empty;
    public string PrimaryImage { get; set; } = string.Empty;
    public decimal MinPrice { get; set; }
    public string PropertyTypeName { get; set; } = string.Empty; // Tên loại hình lưu trú (Khách sạn, Resort...)
    public string PropertyTypeCode { get; set; } = string.Empty; // Mã loại hình lưu trú (HOTEL, RESORT...)

    // Tọa độ địa lý để render marker trên bản đồ OpenStreetMap (NULL nếu khách sạn chưa được geocode)
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public List<string> Amenities { get; set; } = new List<string>();
}
