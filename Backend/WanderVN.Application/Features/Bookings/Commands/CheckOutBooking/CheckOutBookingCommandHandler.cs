using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace WanderVN.Application.Features.Bookings.Commands.CheckOutBooking;

public class CheckOutBookingCommandHandler : IRequestHandler<CheckOutBookingCommand, bool>
{
    private readonly IApplicationDbContext _dbContext;

    public CheckOutBookingCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(CheckOutBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _dbContext.Bookings.FindAsync(new object[] { request.BookingId }, cancellationToken);
        if (booking == null) return false;

        if (booking.ServiceType != "Hotel") return false;

        booking.Status = "Completed"; // mark as completed (checked out)
        booking.CheckedOutAt = DateTimeOffset.UtcNow;

        // free up room if exists
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
