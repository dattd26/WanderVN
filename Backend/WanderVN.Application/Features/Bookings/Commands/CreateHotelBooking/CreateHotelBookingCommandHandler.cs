using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Features.Bookings.Commands.CreateHotelBooking;

public class CreateHotelBookingCommandHandler : IRequestHandler<CreateHotelBookingCommand, HotelBookingResponse>
{
    private readonly IApplicationDbContext _dbContext;

    public CreateHotelBookingCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HotelBookingResponse> Handle(CreateHotelBookingCommand request, CancellationToken cancellationToken)
    {
        // Validate dates
        if (!DateTime.TryParseExact(request.Request.CheckInDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var checkIn) ||
            !DateTime.TryParseExact(request.Request.CheckOutDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var checkOut))
        {
            throw new ArgumentException("Invalid date format. Use yyyy-MM-dd");
        }

        if (checkIn >= checkOut)
            throw new ArgumentException("Check-in must be before check-out");

        // Find RoomType (correct DbSet)
        var roomType = await _dbContext.RoomTypes
            .Where(rt => rt.Id == request.Request.RoomTypeId)
            .Select(rt => new WanderVN.Domain.Entities.RoomTypes { Id = rt.Id, BasePrice = rt.BasePrice })
            .FirstOrDefaultAsync(cancellationToken);

        if (roomType == null)
            throw new KeyNotFoundException("Room type not found");

        // Calculate total price
        decimal totalPrice = request.Request.TotalPrice ?? roomType.BasePrice;

        // Create booking
        var booking = new WanderVN.Domain.Entities.Bookings
        {
            UserId = request.Request.UserId,
            BookingCode = GenerateBookingCode(),
            ServiceType = "Hotel",
            TotalPrice = totalPrice,
            Status = "Pending",
            PaymentStatus = "Unpaid",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _dbContext.Bookings.AddAsync(booking, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Allocate a free Room matching the RoomType
        var room = await _dbContext.Rooms
            .Where(r => r.RoomTypeId == request.Request.RoomTypeId && r.Status == "Available")
            .FirstOrDefaultAsync(cancellationToken);

        if (room == null)
        {
            throw new InvalidOperationException("No available room for selected room type");
        }

        var bookingHotel = new WanderVN.Domain.Entities.BookingHotels
        {
            BookingId = booking.Id,
            RoomId = room.Id,
            CheckInDate = DateOnly.FromDateTime(checkIn),
            CheckOutDate = DateOnly.FromDateTime(checkOut)
        };

        await _dbContext.BookingHotels.AddAsync(bookingHotel, cancellationToken);
        room.Status = "Booked";

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new HotelBookingResponse
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status ?? string.Empty
        };
    }

    private string GenerateBookingCode()
    {
        return "BK" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
    }
}
