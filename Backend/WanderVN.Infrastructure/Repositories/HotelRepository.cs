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
using WanderVN.Application.Features.Hotels.Queries.GetHotelDetail;
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

        // Tối ưu xử lý ngày mặc định độc lập múi giờ (Ví dụ: "2026-05-19")
        var checkInStr = string.IsNullOrWhiteSpace(query.CheckInDate) 
            ? DateTime.Today.ToString("yyyy-MM-dd") 
            : query.CheckInDate;
        var checkOutStr = string.IsNullOrWhiteSpace(query.CheckOutDate) 
            ? DateTime.Today.AddDays(1).ToString("yyyy-MM-dd") 
            : query.CheckOutDate;

        // Parse chính xác tuyệt đối thành DateTime để Dapper truyền kiểu Date/DateTime chuẩn sang SQL Server
        var checkIn = DateTime.ParseExact(checkInStr, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
        var checkOut = DateTime.ParseExact(checkOutStr, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);

        // Chuẩn bị tham số ánh xạ chính xác với Stored Procedure sp_SearchHotels
        var parameters = new DynamicParameters();
        parameters.Add("LocationId", query.LocationId);
        parameters.Add("CheckIn", checkIn);
        parameters.Add("CheckOut", checkOut);
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
        var hotelsResult = (await connection.QueryAsync<SearchHotelsDto>(
            "sp_SearchHotels",
            parameters,
            commandType: CommandType.StoredProcedure
        )).ToList();

        // Tải thêm các tiện ích liên kết với từng khách sạn đã tìm thấy bằng Dapper
        var hotelIds = hotelsResult.Select(h => h.Id).ToList();
        if (hotelIds.Any())
        {
            var amenitiesMap = await connection.QueryAsync<(int HotelId, string Name)>(
                @"SELECT ha.HotelId, a.Name 
                  FROM HotelAmenities ha 
                  JOIN Amenities a ON ha.AmenityId = a.Id 
                  WHERE ha.HotelId IN @HotelIds",
                new { HotelIds = hotelIds }
            );

            var groupedAmenities = amenitiesMap
                .GroupBy(x => x.HotelId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Name).ToList());

            foreach (var hotel in hotelsResult)
            {
                if (groupedAmenities.TryGetValue(hotel.Id, out var list))
                {
                    hotel.Amenities = list;
                }
            }
        }

        return hotelsResult;
    }

    public async Task<HotelDetailDto?> GetHotelDetailAsync(int hotelId, CancellationToken cancellationToken)
    {
        // Use EF Core for complex object mapping and available room calculation
        var hotel = await _dbContext.Hotels
            .Include(h => h.Location)
            .Include(h => h.HotelImages)
            .Include(h => h.RoomTypes)
            .Where(h => h.Id == hotelId && h.IsActive == true)
            .Select(h => new HotelDetailDto
            {
                Id = h.Id,
                Name = h.Name,
                Address = h.Address,
                StarRating = h.StarRating,
                Description = h.Description,
                LocationName = h.Location != null ? h.Location.Name : null,
                Images = h.HotelImages.OrderByDescending(img => img.IsPrimary).Select(img => img.ImageUrl ?? string.Empty).ToList(),
                RoomTypes = h.RoomTypes.Select(rt => new RoomTypeInfo
                {
                    Id = rt.Id,
                    Name = rt.Name,
                    BasePrice = rt.BasePrice,
                    Capacity = rt.Capacity,
                    TotalRooms = rt.TotalRooms,
                    Images = rt.RoomTypeImages.Select(img => img.ImageUrl ?? string.Empty).ToList(),
                    // Calculate available rooms by comparing total rooms with current non-cancelled bookings
                    AvailableRooms = rt.TotalRooms - _dbContext.BookingHotels
                        .Join(_dbContext.Rooms, bh => bh.RoomId, r => r.Id, (bh, r) => new { bh, r })
                        .Join(_dbContext.Bookings, x => x.bh.BookingId, b => b.Id, (x, b) => new { x.bh, x.r, b })
                        .Count(x => x.r.RoomTypeId == rt.Id && x.b.Status != "Cancelled" && !(x.bh.CheckOutDate <= DateOnly.FromDateTime(System.DateTime.Today) || x.bh.CheckInDate >= DateOnly.FromDateTime(System.DateTime.Today)))
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        return hotel;
    }
}
