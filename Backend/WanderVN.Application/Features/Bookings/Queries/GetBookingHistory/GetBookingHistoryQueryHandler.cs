using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Enums;

namespace WanderVN.Application.Features.Bookings.Queries.GetBookingHistory;

public class GetBookingHistoryQueryHandler : IRequestHandler<GetBookingHistoryQuery, List<BookingHistoryDto>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetBookingHistoryQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<BookingHistoryDto>> Handle(GetBookingHistoryQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("Không thể xác định người dùng.");

        // Lấy lịch sử đặt phòng khách sạn
        var hotelHistory = await _dbContext.BookingHotels
            .Join(_dbContext.Bookings, bh => bh.BookingId, b => b.Id, (bh, b) => new { bh, b })
            .Join(_dbContext.Rooms, x => x.bh.RoomId, r => r.Id, (x, r) => new { x.bh, x.b, r })
            .Join(_dbContext.RoomTypes, x => x.r.RoomTypeId, rt => rt.Id, (x, rt) => new { x.bh, x.b, x.r, rt })
            .Join(_dbContext.Hotels, x => x.rt.HotelId, h => h.Id, (x, h) => new { x.bh, x.b, x.r, x.rt, h })
            .Where(x => x.b.UserId == userId && x.b.ServiceType == BookingServiceType.Hotel)
            .Select(x => new BookingHistoryDto
            {
                ServiceType = "Hotel",
                BookingId = x.b.Id,
                BookingCode = x.b.BookingCode,
                TotalPrice = x.b.TotalPrice,
                Status = x.b.Status.ToString(),
                CreatedAt = x.b.CreatedAt ?? DateTimeOffset.UtcNow,
                HotelDetails = new HotelBookingHistoryDetailDto
                {
                    HotelId = x.h.Id,
                    HotelName = x.h.Name,
                    HotelAddress = x.h.Address ?? string.Empty,
                    HotelImage = _dbContext.HotelImages
                        .Where(img => img.HotelId == x.h.Id)
                        .OrderByDescending(img => img.IsPrimary)
                        .Select(img => img.ImageUrl)
                        .FirstOrDefault() ?? string.Empty,
                    RoomTypeName = x.rt.Name,
                    CheckInDate = x.bh.CheckInDate.ToString("yyyy-MM-dd"),
                    CheckOutDate = x.bh.CheckOutDate.ToString("yyyy-MM-dd")
                },
                FlightDetails = null
            })
            .ToListAsync(cancellationToken);

        // Lấy lịch sử đặt vé máy bay
        var flightHistory = await (from b in _dbContext.Bookings
                                   where b.UserId == userId && b.ServiceType == BookingServiceType.Flight
                                   let bf = _dbContext.BookingFlights.FirstOrDefault(bf_item => bf_item.BookingId == b.Id && bf_item.FlightId != null)
                                   let f = bf != null ? bf.Flight : null
                                   let a = f != null ? f.Airline : null
                                   let dep = f != null ? f.DepAirport : null
                                   let arr = f != null ? f.ArrAirport : null
                                   select new BookingHistoryDto
                                   {
                                       ServiceType = "Flight",
                                       BookingId = b.Id,
                                       BookingCode = b.BookingCode,
                                       Status = b.Status.ToString(),
                                       TotalPrice = b.TotalPrice,
                                       CreatedAt = b.CreatedAt ?? DateTimeOffset.UtcNow,
                                       HotelDetails = null,
                                       FlightDetails = new FlightBookingHistoryDetailDto
                                       {
                                           AirlineName = a != null ? a.Name : string.Empty,
                                           AirlineLogo = a != null ? (a.LogoUrl ?? string.Empty) : string.Empty,
                                           FlightNumber = f != null ? f.FlightNumber : string.Empty,
                                           DepAirportCode = dep != null ? dep.IataCode : string.Empty,
                                           ArrAirportCode = arr != null ? arr.IataCode : string.Empty,
                                           DepAirportCity = dep != null ? (dep.City ?? string.Empty) : string.Empty,
                                           ArrAirportCity = arr != null ? (arr.City ?? string.Empty) : string.Empty,
                                           DepTime = f != null ? f.DepTime.ToString("yyyy-MM-dd HH:mm") : string.Empty,
                                           ArrTime = f != null ? f.ArrTime.ToString("yyyy-MM-dd HH:mm") : string.Empty,
                                           Passengers = null
                                       }
                                   }).ToListAsync(cancellationToken);

        var history = hotelHistory.Concat(flightHistory)
            .OrderByDescending(x => x.CreatedAt)
            .ToList();

        return history;
    }
}
