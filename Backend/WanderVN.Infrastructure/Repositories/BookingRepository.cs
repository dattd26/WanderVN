using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Enums;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class BookingRepository : GenericRepository<Bookings>, IBookingRepository
{
    private readonly WanderVNDbContext _dbContext;

    public BookingRepository(WanderVNDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BookingLookupDetailDto?> LookupBookingAsync(string bookingCode, string email, CancellationToken cancellationToken = default)
    {
        var result = _dbContext.Database.SqlQuery<BookingLookupDetailDto>(
            $"EXEC sp_LookupBooking @BookingCode = {bookingCode}, @Email = {email}");

        await foreach (var item in result.AsAsyncEnumerable().WithCancellation(cancellationToken))
        {
            return item;
        }

        return null;
    }

    public async Task<List<BookingHistoryDto>> GetBookingHistoryAsync(int userId, CancellationToken cancellationToken = default)
    {
        var connection = _dbContext.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
        {
            await connection.OpenAsync(cancellationToken);
        }

        const string sql = @"
            SELECT 
                'Hotel' AS ServiceType,
                b.Id AS BookingId,
                b.BookingCode,
                b.TotalPrice,
                b.Status,
                b.CreatedAt,
                
                -- Hotel specific columns
                h.Id AS HotelId,
                h.Name AS HotelName,
                h.Address AS HotelAddress,
                rt.Name AS RoomTypeName,
                bh.CheckInDate,
                bh.CheckOutDate,
                (SELECT TOP 1 img.ImageUrl 
                 FROM HotelImages img 
                 WHERE img.HotelId = h.Id 
                 ORDER BY img.IsPrimary DESC, img.Id ASC) AS HotelImage,

                -- Flight specific columns (null for hotels)
                NULL AS AirlineName,
                NULL AS AirlineLogo,
                NULL AS FlightNumber,
                NULL AS DepAirportCode,
                NULL AS ArrAirportCode,
                NULL AS DepAirportCity,
                NULL AS ArrAirportCity,
                NULL AS DepTime,
                NULL AS ArrTime
            FROM Bookings b
            INNER JOIN BookingHotels bh ON bh.BookingId = b.Id
            INNER JOIN Rooms r ON bh.RoomId = r.Id
            INNER JOIN RoomTypes rt ON r.RoomTypeId = rt.Id
            INNER JOIN Hotels h ON rt.HotelId = h.Id
            WHERE b.UserId = @UserId AND b.ServiceType = 1 -- BookingServiceType.Hotel

            UNION ALL

            SELECT 
                'Flight' AS ServiceType,
                b.Id AS BookingId,
                b.BookingCode,
                b.TotalPrice,
                b.Status,
                b.CreatedAt,
                
                -- Hotel specific columns (null for flights)
                NULL AS HotelId,
                NULL AS HotelName,
                NULL AS HotelAddress,
                NULL AS RoomTypeName,
                NULL AS CheckInDate,
                NULL AS CheckOutDate,
                NULL AS HotelImage,

                -- Flight specific columns
                a.Name AS AirlineName,
                a.LogoUrl AS AirlineLogo,
                f.FlightNumber,
                dep.IataCode AS DepAirportCode,
                arr.IataCode AS ArrAirportCode,
                dep.City AS DepAirportCity,
                arr.City AS ArrAirportCity,
                f.DepTime,
                f.ArrTime
            FROM Bookings b
            LEFT JOIN (
                SELECT 
                    BookingId,
                    FlightId,
                    ROW_NUMBER() OVER (PARTITION BY BookingId ORDER BY Id) as RowNum
                FROM BookingFlights
                WHERE FlightId IS NOT NULL
            ) bff ON bff.BookingId = b.Id AND bff.RowNum = 1
            LEFT JOIN Flights f ON bff.FlightId = f.Id
            LEFT JOIN Airlines a ON f.AirlineId = a.Id
            LEFT JOIN Airports dep ON f.DepAirportId = dep.Id
            LEFT JOIN Airports arr ON f.ArrAirportId = arr.Id
            WHERE b.UserId = @UserId AND b.ServiceType = 0 -- BookingServiceType.Flight

            ORDER BY CreatedAt DESC";

        var flatList = await connection.QueryAsync<FlatBookingHistoryDto>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken)
        );

        // Ánh xạ từ cấu hình phẳng SQL sang cấu trúc DTO có lồng nhau
        return flatList.Select(x => new BookingHistoryDto
        {
            ServiceType = x.ServiceType,
            BookingId = x.BookingId,
            BookingCode = x.BookingCode,
            TotalPrice = x.TotalPrice,
            Status = ((BookingStatus)x.Status).ToString(),
            CreatedAt = x.CreatedAt ?? DateTimeOffset.UtcNow,
            HotelDetails = x.ServiceType == "Hotel" && x.HotelId.HasValue ? new HotelBookingHistoryDetailDto
            {
                HotelId = x.HotelId.Value,
                HotelName = x.HotelName ?? string.Empty,
                HotelAddress = x.HotelAddress ?? string.Empty,
                HotelImage = x.HotelImage ?? string.Empty,
                RoomTypeName = x.RoomTypeName ?? string.Empty,
                CheckInDate = x.CheckInDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                CheckOutDate = x.CheckOutDate?.ToString("yyyy-MM-dd") ?? string.Empty
            } : null,
            FlightDetails = x.ServiceType == "Flight" ? new FlightBookingHistoryDetailDto
            {
                AirlineName = x.AirlineName ?? string.Empty,
                AirlineLogo = x.AirlineLogo ?? string.Empty,
                FlightNumber = x.FlightNumber ?? string.Empty,
                DepAirportCode = x.DepAirportCode ?? string.Empty,
                ArrAirportCode = x.ArrAirportCode ?? string.Empty,
                DepAirportCity = x.DepAirportCity ?? string.Empty,
                ArrAirportCity = x.ArrAirportCity ?? string.Empty,
                DepTime = x.DepTime?.ToString("yyyy-MM-dd HH:mm") ?? string.Empty,
                ArrTime = x.ArrTime?.ToString("yyyy-MM-dd HH:mm") ?? string.Empty,
                Passengers = null
            } : null
        }).ToList();
    }

    // Lớp nội bộ hỗ trợ map kết quả query phẳng từ database
    private class FlatBookingHistoryDto
    {
        public string ServiceType { get; set; } = string.Empty;
        public int BookingId { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public int Status { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }

        public int? HotelId { get; set; }
        public string? HotelName { get; set; }
        public string? HotelAddress { get; set; }
        public string? HotelImage { get; set; }
        public string? RoomTypeName { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }

        public string? AirlineName { get; set; }
        public string? AirlineLogo { get; set; }
        public string? FlightNumber { get; set; }
        public string? DepAirportCode { get; set; }
        public string? ArrAirportCode { get; set; }
        public string? DepAirportCity { get; set; }
        public string? ArrAirportCity { get; set; }
        public DateTime? DepTime { get; set; }
        public DateTime? ArrTime { get; set; }
    }
}
