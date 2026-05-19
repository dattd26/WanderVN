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
}
