using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.Flights.Queries.GetAirports;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class AirportRepository : IAirportRepository
{
    private readonly WanderVNDbContext _dbContext;

    public AirportRepository(WanderVNDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<AirportDto>> SearchAirportsAsync(string? keyword, CancellationToken cancellationToken)
    {
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
        {
            await connection.OpenAsync(cancellationToken);
        }

        var trimmedKeyword = keyword?.Trim().ToLower() ?? "";

        if (string.IsNullOrEmpty(trimmedKeyword))
        {
            // Trả về tất cả các sân bay nếu không có keyword (giới hạn 100 để an toàn)
            const string sql = @"
                SELECT TOP 100 IataCode, Name, City
                FROM Airports
                ORDER BY City";

            var result = await connection.QueryAsync<AirportDto>(
                new CommandDefinition(sql, cancellationToken: cancellationToken)
            );
            return result.AsList();
        }

        // Tìm kiếm sân bay theo IATA Code, Tên hoặc Thành phố
        const string searchSql = @"
            SELECT TOP 15 IataCode, Name, City
            FROM Airports
            WHERE LOWER(IataCode) COLLATE Latin1_General_CI_AI LIKE @Keyword
               OR LOWER(Name) COLLATE Latin1_General_CI_AI LIKE @Keyword
               OR LOWER(City) COLLATE Latin1_General_CI_AI LIKE @Keyword
            ORDER BY 
                CASE WHEN LOWER(IataCode) COLLATE Latin1_General_CI_AI = @ExactKeyword THEN 0 ELSE 1 END,
                City";

        var searchResult = await connection.QueryAsync<AirportDto>(
            new CommandDefinition(searchSql, new { Keyword = $"%{trimmedKeyword}%", ExactKeyword = trimmedKeyword }, cancellationToken: cancellationToken)
        );

        return searchResult.AsList();
    }
}
