using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Queries.GetHotelBookingDetail;

public class GetHotelBookingDetailQueryHandler : IRequestHandler<GetHotelBookingDetailQuery, HotelBookingHistoryDto?>
{
    private readonly IApplicationDbContext _dbContext;

    public GetHotelBookingDetailQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HotelBookingHistoryDto?> Handle(GetHotelBookingDetailQuery request, CancellationToken cancellationToken)
    {
        var detail = await _dbContext.BookingHotels
            .Join(_dbContext.Bookings, bh => bh.BookingId, b => b.Id, (bh, b) => new { bh, b })
            .Join(_dbContext.Rooms, x => x.bh.RoomId, r => r.Id, (x, r) => new { x.bh, x.b, r })
            .Join(_dbContext.RoomTypes, x => x.r.RoomTypeId, rt => rt.Id, (x, rt) => new { x.bh, x.b, x.r, rt })
            .Join(_dbContext.Hotels, x => x.rt.HotelId, h => h.Id, (x, h) => new { x.bh, x.b, x.r, x.rt, h })
            .Where(x => x.b.Id == request.BookingId && x.b.ServiceType == "Hotel")
            .Select(x => new HotelBookingHistoryDto
            {
                BookingId = x.b.Id,
                BookingCode = x.b.BookingCode,
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
                CheckOutDate = x.bh.CheckOutDate.ToString("yyyy-MM-dd"),
                TotalPrice = x.b.TotalPrice,
                Status = x.b.Status ?? "Pending",
                CreatedAt = x.b.CreatedAt ?? System.DateTimeOffset.UtcNow,

            })
            .FirstOrDefaultAsync(cancellationToken);

        return detail;
    }
}
