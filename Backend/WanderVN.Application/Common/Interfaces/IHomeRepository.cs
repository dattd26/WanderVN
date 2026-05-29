using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.Features.Home.Queries.GetHomeData;
using WanderVN.Application.Features.Hotels.Queries.SearchHotels;

namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Giao diện cổng (Port) phục vụ truy xuất dữ liệu Trang chủ/Bộ sưu tập.
/// Được tầng Application sử dụng và tầng Infrastructure triển khai chi tiết.
/// </summary>
public interface IHomeRepository
{
    /// <summary>
    /// Lấy chi tiết của một Travel Mood kèm theo danh sách Khách sạn được gán bằng Stored Procedure và Dapper.
    /// </summary>
    Task<(HomeTravelMoodDto? Mood, List<SearchHotelsDto> Hotels)> GetTravelMoodDetailAsync(string moodId, CancellationToken cancellationToken);
}
