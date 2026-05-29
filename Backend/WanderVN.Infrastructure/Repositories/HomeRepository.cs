using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.Home.Queries.GetHomeData;
using WanderVN.Application.Features.Hotels.Queries.SearchHotels;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

/// <summary>
/// Triển khai thực tế của IHomeRepository bằng cách sử dụng Stored Procedure và Dapper.
/// </summary>
public class HomeRepository : IHomeRepository
{
    private readonly WanderVNDbContext _dbContext;

    public HomeRepository(WanderVNDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(HomeTravelMoodDto? Mood, List<SearchHotelsDto> Hotels)> GetTravelMoodDetailAsync(string moodId, CancellationToken cancellationToken)
    {
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
        {
            await connection.OpenAsync(cancellationToken);
        }

        var parameters = new DynamicParameters();
        parameters.Add("MoodId", moodId);

        using var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(
                "sp_GetTravelMoodById",
                parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: cancellationToken
            )
        );

        var mood = await multi.ReadFirstOrDefaultAsync<HomeTravelMoodDto>();
        if (mood == null)
        {
            return (null, new List<SearchHotelsDto>());
        }

        var hotels = (await multi.ReadAsync<SearchHotelsDto>()).ToList();
        var amenities = (await multi.ReadAsync<dynamic>()).ToList();

        if (hotels.Any() && amenities.Any())
        {
            var groupedAmenities = amenities
                .GroupBy(a => (int)a.HotelId)
                .ToDictionary(g => g.Key, g => g.Select(a => (string)a.Name).ToList());

            foreach (var hotel in hotels)
            {
                if (groupedAmenities.TryGetValue(hotel.Id, out var hotelAmenities))
                {
                    hotel.Amenities = hotelAmenities;
                }
                else
                {
                    hotel.Amenities = new List<string>();
                }
            }
        }
        else
        {
            foreach (var hotel in hotels)
            {
                hotel.Amenities = new List<string>();
            }
        }

        return (mood, hotels);
    }
}
