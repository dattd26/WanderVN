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

    public async Task<int> AddRoomTypeAsync(
        int partnerId,
        int hotelId,
        string name,
        decimal basePrice,
        int capacity,
        int totalRooms,
        string? description,
        CancellationToken cancellationToken)
    {
        // Mở kết nối cơ sở dữ liệu nếu kết nối đang đóng
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
            await connection.OpenAsync(cancellationToken);

        // Cấu hình các tham số đầu vào cho Stored Procedure
        var parameters = new DynamicParameters();
        parameters.Add("PartnerId", partnerId);
        parameters.Add("HotelId", hotelId);
        parameters.Add("Name", name);
        parameters.Add("BasePrice", basePrice);
        parameters.Add("Capacity", capacity);
        parameters.Add("TotalRooms", totalRooms);
        parameters.Add("Description", description);

        // Thực thi Stored Procedure sp_Partner_AddRoomType và lấy về Id của hạng phòng vừa được tạo
        var newId = await connection.QuerySingleAsync<int>(
            "sp_Partner_AddRoomType",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return newId;
    }

    public async Task<int> DeleteRoomTypeAsync(
        int partnerId,
        int roomTypeId,
        CancellationToken cancellationToken)
    {
        // Mở kết nối cơ sở dữ liệu nếu kết nối đang đóng
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
            await connection.OpenAsync(cancellationToken);

        // Cấu hình các tham số đầu vào cho Stored Procedure
        var parameters = new DynamicParameters();
        parameters.Add("PartnerId", partnerId);
        parameters.Add("RoomTypeId", roomTypeId);

        // Thực thi Stored Procedure sp_Partner_DeleteRoomType
        var affectedRows = await connection.QuerySingleAsync<int>(
            "sp_Partner_DeleteRoomType",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return affectedRows;
    }

    public async Task<int> UpdateRoomTypeAsync(
        int partnerId,
        int roomTypeId,
        string name,
        decimal basePrice,
        int capacity,
        int totalRooms,
        CancellationToken cancellationToken)
    {
        // Mở kết nối cơ sở dữ liệu nếu kết nối đang đóng
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
            await connection.OpenAsync(cancellationToken);

        // Cấu hình các tham số đầu vào cho Stored Procedure
        var parameters = new DynamicParameters();
        parameters.Add("PartnerId", partnerId);
        parameters.Add("RoomTypeId", roomTypeId);
        parameters.Add("Name", name);
        parameters.Add("BasePrice", basePrice);
        parameters.Add("Capacity", capacity);
        parameters.Add("TotalRooms", totalRooms);

        // Thực thi Stored Procedure sp_Partner_UpdateRoomType
        var affectedRows = await connection.QuerySingleAsync<int>(
            "sp_Partner_UpdateRoomType",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return affectedRows;
    }

    public async Task<int> ToggleRoomBlockAsync(
        int partnerId,
        int roomTypeId,
        DateOnly blockDate,
        string action,
        CancellationToken cancellationToken)
    {
        // Mở kết nối cơ sở dữ liệu nếu kết nối đang đóng
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
            await connection.OpenAsync(cancellationToken);

        // Cấu hình các tham số đầu vào cho Stored Procedure
        var parameters = new DynamicParameters();
        parameters.Add("PartnerId", partnerId);
        parameters.Add("RoomTypeId", roomTypeId);
        parameters.Add("BlockDate", blockDate);
        parameters.Add("Action", action);

        // Thực thi Stored Procedure sp_Partner_ToggleRoomBlock
        var affectedRows = await connection.QuerySingleAsync<int>(
            "sp_Partner_ToggleRoomBlock",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return affectedRows;
    }
}
