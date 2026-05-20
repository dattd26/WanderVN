using WanderVN.Application.Features.Hotels.Queries.SearchHotels;
namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Giao diện cổng (Port) phục vụ truy xuất dữ liệu Khách sạn chuyên sâu.
/// Được tầng Application sử dụng và tầng Infrastructure triển khai chi tiết.
/// </summary>
public interface IHotelRepository
{
    /// <summary>
    /// Tìm kiếm và lọc danh sách khách sạn khả dụng cho trang chủ.
    /// </summary>
    Task<List<SearchHotelsDto>> SearchHotelsAsync(SearchHotelsQuery query, CancellationToken cancellationToken);
}
