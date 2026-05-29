using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Queries.LookupBooking;

public class LookupBookingQueryHandler : IRequestHandler<LookupBookingQuery, BookingLookupDetailDto?>
{
    private readonly IApplicationDbContext _dbContext;

    public LookupBookingQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BookingLookupDetailDto?> Handle(LookupBookingQuery request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var booking = await _dbContext.Bookings
            .Where(b => b.BookingCode == request.BookingCode)
            .FirstOrDefaultAsync(cancellationToken);

        if (booking == null) return null;

        // Xác thực email: khớp với email lưu trực tiếp trên booking HOẶC email của User liên kết
        bool emailMatched = false;

        if (!string.IsNullOrEmpty(booking.Email) &&
            booking.Email.Trim().ToLowerInvariant() == normalizedEmail)
        {
            emailMatched = true;
        }

        if (!emailMatched && booking.UserId.HasValue)
        {
            var user = await _dbContext.Users
                .Where(u => u.Id == booking.UserId.Value)
                .FirstOrDefaultAsync(cancellationToken);

            if (user != null && !string.IsNullOrEmpty(user.Email) &&
                user.Email.Trim().ToLowerInvariant() == normalizedEmail)
            {
                emailMatched = true;
            }
        }

        if (!emailMatched) return null;

        var result = new BookingLookupDetailDto
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            ServiceType = booking.ServiceType,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status ?? "Pending",
            PaymentStatus = booking.PaymentStatus ?? "Unpaid",
            CreatedAt = booking.CreatedAt ?? DateTimeOffset.UtcNow,
            CustomerName = booking.CustomerName ?? string.Empty,
            Email = booking.Email ?? string.Empty,
            CustomerPhone = booking.CustomerPhone ?? string.Empty
        };

        if (booking.ServiceType == "Hotel")
        {
            var hotelDetail = await _dbContext.BookingHotels
                .Where(bh => bh.BookingId == booking.Id)
                .Join(_dbContext.Rooms, bh => bh.RoomId, r => r.Id, (bh, r) => new { bh, r })
                .Join(_dbContext.RoomTypes, x => x.r.RoomTypeId, rt => rt.Id, (x, rt) => new { x.bh, x.r, rt })
                .Join(_dbContext.Hotels, x => x.rt.HotelId, h => h.Id, (x, h) => new { x.bh, x.rt, h })
                .Select(x => new
                {
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
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (hotelDetail != null)
            {
                result.HotelName = hotelDetail.HotelName;
                result.HotelAddress = hotelDetail.HotelAddress;
                result.HotelImage = hotelDetail.HotelImage;
                result.RoomTypeName = hotelDetail.RoomTypeName;
                result.CheckInDate = hotelDetail.CheckInDate;
                result.CheckOutDate = hotelDetail.CheckOutDate;
            }
        }
        else if (booking.ServiceType == "Flight")
        {
            var passengers = await _dbContext.BookingFlights
                .Where(bf => bf.BookingId == booking.Id)
                .Select(bf => bf.PassengerName ?? "N/A")
                .ToListAsync(cancellationToken);

            result.PassengerNames = string.Join(", ", passengers);
        }

        return result;
    }
}
