using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.Hotels.Queries.SearchHotels;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

/// <summary>
/// Triển khai thực tế của IHotelRepository bằng cách sử dụng Dapper kết hợp với DbConnection của DbContext.
/// </summary>
public class HotelRepository : IHotelRepository
{
    private readonly WanderVNDbContext _dbContext;

    public HotelRepository(WanderVNDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<SearchHotelsDto>> SearchHotelsAsync(SearchHotelsQuery query, CancellationToken cancellationToken)
    {
        var connection = _dbContext.Database.GetDbConnection();

        // SQL động tối ưu hóa việc đếm phòng khả dụng
        var sql = @"
            SELECT DISTINCT h.Id, h.Name, h.Address, h.StarRating, h.Description, l.Name AS LocationName, 
                   img.ImageUrl AS PrimaryImage,
                   rt_min.MinPrice
            FROM Hotels h
            JOIN Locations l ON h.LocationId = l.Id
            JOIN RoomTypes rt ON rt.HotelId = h.Id
            LEFT JOIN HotelImages img ON h.Id = img.HotelId AND img.IsPrimary = 1
            CROSS APPLY (
                SELECT MIN(BasePrice) AS MinPrice 
                FROM RoomTypes 
                WHERE HotelId = h.Id
            ) rt_min
            WHERE h.LocationId = @LocationId
              AND h.IsActive = 1
              AND rt.Capacity >= @Capacity
              AND dbo.fn_GetAvailableRoomCount(rt.Id, @CheckInDate, @CheckOutDate) > 0";

        var parameters = new DynamicParameters();
        parameters.Add("LocationId", query.LocationId);
        parameters.Add("CheckInDate", query.CheckInDate);
        parameters.Add("CheckOutDate", query.CheckOutDate);
        parameters.Add("Capacity", query.Capacity);

        // Lọc động theo khoảng giá
        if (query.MinPrice.HasValue)
        {
            sql += " AND rt_min.MinPrice >= @MinPrice";
            parameters.Add("MinPrice", query.MinPrice.Value);
        }
        if (query.MaxPrice.HasValue)
        {
            sql += " AND rt_min.MinPrice <= @MaxPrice";
            parameters.Add("MaxPrice", query.MaxPrice.Value);
        }

        // Sắp xếp và phân trang Offset-based
        sql += @"
            ORDER BY rt_min.MinPrice ASC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        var offset = (query.PageNumber - 1) * query.PageSize;
        parameters.Add("Offset", offset);
        parameters.Add("PageSize", query.PageSize);

        if (connection.State == ConnectionState.Closed)
        {
            await connection.OpenAsync(cancellationToken);
        }

        var hotels = await connection.QueryAsync<SearchHotelsDto>(sql, parameters);
        return hotels.ToList();
    }
}
