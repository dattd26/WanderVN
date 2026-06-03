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

namespace WanderVN.Application.Features.Bookings.Queries.GetBookingDetail;

public class GetBookingDetailQueryHandler : IRequestHandler<GetBookingDetailQuery, BookingHistoryDto?>
{
    private readonly IApplicationDbContext _dbContext;

    public GetBookingDetailQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BookingHistoryDto?> Handle(GetBookingDetailQuery request, CancellationToken cancellationToken)
    {
        var booking = await _dbContext.Bookings
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
            return null;

        if (booking.ServiceType == BookingServiceType.Hotel)
        {
            var hotelDetail = await _dbContext.BookingHotels
                .Join(_dbContext.Rooms, bh => bh.RoomId, r => r.Id, (bh, r) => new { bh, r })
                .Join(_dbContext.RoomTypes, x => x.r.RoomTypeId, rt => rt.Id, (x, rt) => new { x.bh, x.r, rt })
                .Join(_dbContext.Hotels, x => x.rt.HotelId, h => h.Id, (x, h) => new { x.bh, x.r, x.rt, h })
                .Where(x => x.bh.BookingId == booking.Id)
                .Select(x => new BookingHistoryDto
                {
                    ServiceType = "Hotel",
                    BookingId = booking.Id,
                    BookingCode = booking.BookingCode,
                    TotalPrice = booking.TotalPrice,
                    Status = booking.Status.ToString(),
                    CreatedAt = booking.CreatedAt ?? DateTimeOffset.UtcNow,
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
                .FirstOrDefaultAsync(cancellationToken);

            return hotelDetail;
        }
        else if (booking.ServiceType == BookingServiceType.Flight)
        {
            var bookingFlights = await _dbContext.BookingFlights
                .Include(bf => bf.Flight)
                    .ThenInclude(f => f!.Airline)
                .Include(bf => bf.Flight)
                    .ThenInclude(f => f!.DepAirport)
                .Include(bf => bf.Flight)
                    .ThenInclude(f => f!.ArrAirport)
                .Where(bf => bf.BookingId == booking.Id)
                .ToListAsync(cancellationToken);

            if (!bookingFlights.Any())
            {
                // Fallback nếu không parse được chặng bay
                return new BookingHistoryDto
                {
                    ServiceType = "Flight",
                    BookingId = booking.Id,
                    BookingCode = booking.BookingCode,
                    TotalPrice = booking.TotalPrice,
                    Status = booking.Status.ToString(),
                    CreatedAt = booking.CreatedAt ?? DateTimeOffset.UtcNow,
                    HotelDetails = null,
                    FlightDetails = new FlightBookingHistoryDetailDto
                    {
                        AirlineName = "N/A",
                        AirlineLogo = string.Empty,
                        FlightNumber = "N/A",
                        DepAirportCode = "N/A",
                        ArrAirportCode = "N/A",
                        DepAirportCity = "N/A",
                        ArrAirportCity = "N/A",
                        DepTime = string.Empty,
                        ArrTime = string.Empty,
                        Passengers = new List<FlightPassengerInfoDto>()
                    }
                };
            }

            var firstBf = bookingFlights.First();
            var flight = firstBf.Flight;
            var airline = flight?.Airline;
            var depAirport = flight?.DepAirport;
            var arrAirport = flight?.ArrAirport;

            var flightDetail = new BookingHistoryDto
            {
                ServiceType = "Flight",
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status.ToString(),
                CreatedAt = booking.CreatedAt ?? DateTimeOffset.UtcNow,
                HotelDetails = null,
                FlightDetails = new FlightBookingHistoryDetailDto
                {
                    AirlineName = airline?.Name ?? string.Empty,
                    AirlineLogo = airline?.LogoUrl ?? string.Empty,
                    FlightNumber = flight?.FlightNumber ?? string.Empty,
                    DepAirportCode = depAirport?.IataCode ?? string.Empty,
                    ArrAirportCode = arrAirport?.IataCode ?? string.Empty,
                    DepAirportCity = depAirport?.City ?? string.Empty,
                    ArrAirportCity = arrAirport?.City ?? string.Empty,
                    DepTime = flight != null ? flight.DepTime.ToString("yyyy-MM-dd HH:mm") : string.Empty,
                    ArrTime = flight != null ? flight.ArrTime.ToString("yyyy-MM-dd HH:mm") : string.Empty,
                    Passengers = bookingFlights
                        .Select(bf => new FlightPassengerInfoDto
                        {
                            PassengerName = bf.PassengerName ?? string.Empty,
                            PassportNumber = bf.PassportNumber ?? string.Empty,
                            SeatNumber = bf.SeatNumber ?? string.Empty
                        })
                        .GroupBy(p => new { p.PassengerName, p.PassportNumber, p.SeatNumber })
                        .Select(g => g.First())
                        .ToList()
                }
            };

            return flightDetail;
        }

        return null;
    }
}
