using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Features.Bookings.Commands.CancelBooking;

public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand, bool>
{
    private readonly IApplicationDbContext _dbContext;

    public CancelBookingCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _dbContext.Bookings.FindAsync(new object[] { request.BookingId }, cancellationToken);
        if (booking == null) return false;

        // Only allow cancel if service type is Hotel and not already cancelled/completed
        if (booking.ServiceType != "Hotel") return false;

        booking.Status = "Cancelled";

        // If there is associated booking hotel record, set room status back to Available
        var bh = await _dbContext.BookingHotels
            .FirstOrDefaultAsync(b => b.BookingId == request.BookingId, cancellationToken);
        if (bh != null && bh.RoomId.HasValue)
        {
            var room = await _dbContext.Rooms.FindAsync(new object[] { bh.RoomId.Value }, cancellationToken);
            if (room != null)
            {
                room.Status = "Available";
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
