using System.Data;
using Dapper;
using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

/// <summary>
/// Triển khai <see cref="IPartnerRepository"/> bằng Dapper, gọi trực tiếp các Stored Procedure
/// thuộc nhóm sp_Partner_* để đảm bảo authorization và business logic ở DB layer.
/// </summary>
public class PartnerRepository : IPartnerRepository
{
    private readonly WanderVNDbContext _dbContext;

    public PartnerRepository(WanderVNDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<PartnerHotelDashboardModel>> ListMyHotelsAsync(
        int partnerId,
        int? statusFilter,
        CancellationToken cancellationToken)
    {
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
            await connection.OpenAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("PartnerId", partnerId);
        parameters.Add("Status", statusFilter);

        var result = await connection.QueryAsync<PartnerHotelDashboardModel>(
            "sp_Partner_ListMyHotels",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return result.ToList();
    }

    public async Task<SubmitHotelResult> SubmitHotelAsync(
        int partnerId,
        string name,
        string address,
        int? locationId,
        int? propertyTypeId,
        string? description,
        int? starRating,
        decimal? latitude,
        decimal? longitude,
        string? cancellationPolicy,
        string? amenityIdsCsv,
        CancellationToken cancellationToken)
    {
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
            await connection.OpenAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("PartnerId", partnerId);
        parameters.Add("Name", name);
        parameters.Add("Address", address);
        parameters.Add("LocationId", locationId);
        parameters.Add("PropertyTypeId", propertyTypeId);
        parameters.Add("Description", description);
        parameters.Add("StarRating", starRating);
        parameters.Add("Latitude", latitude);
        parameters.Add("Longitude", longitude);
        parameters.Add("CancellationPolicy", cancellationPolicy);
        parameters.Add("AmenityIdsCsv", amenityIdsCsv);

        var result = await connection.QuerySingleAsync<SubmitHotelResult>(
            "sp_Partner_SubmitHotel",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task<int> AddHotelImageAsync(
        int partnerId,
        int hotelId,
        string imageUrl,
        string? publicId,
        bool isPrimary,
        CancellationToken cancellationToken)
    {
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
            await connection.OpenAsync(cancellationToken);

        var parameters = new DynamicParameters();
        parameters.Add("PartnerId", partnerId);
        parameters.Add("HotelId", hotelId);
        parameters.Add("ImageUrl", imageUrl);
        parameters.Add("PublicId", publicId);
        parameters.Add("IsPrimary", isPrimary);

        // SP trả NewImageId qua SCOPE_IDENTITY() → decimal, cần cast về int
        var newId = await connection.QuerySingleAsync<decimal>(
            "sp_Partner_AddHotelImage",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return (int)newId;
    }
}
