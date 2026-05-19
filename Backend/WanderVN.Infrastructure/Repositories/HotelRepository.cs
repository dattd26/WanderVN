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
/// Triển khai thực tế của IHotelRepository bằng cách sử dụng Stored Procedure và Dapper.
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

        // Chuẩn bị tham số ánh xạ chính xác với Stored Procedure sp_SearchHotels
        var parameters = new DynamicParameters();
        parameters.Add("LocationId", query.LocationId);
        parameters.Add("CheckIn", query.CheckInDate);
        parameters.Add("CheckOut", query.CheckOutDate);
        parameters.Add("Capacity", query.Capacity);
        parameters.Add("MinPrice", query.MinPrice);
        parameters.Add("MaxPrice", query.MaxPrice);
        parameters.Add("PageNumber", query.PageNumber);
        parameters.Add("PageSize", query.PageSize);

        if (connection.State == ConnectionState.Closed)
        {
            await connection.OpenAsync(cancellationToken);
        }

        // Gọi trực tiếp Stored Procedure giúp tối ưu hóa hiệu năng biên dịch thực thi của SQL Server
        var hotels = await connection.QueryAsync<SearchHotelsDto>(
            "sp_SearchHotels",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return hotels.ToList();
    }
}
