using MediatR;

namespace WanderVN.Application.Features.Bookings.Commands.CancelBooking;

public class CancelBookingCommand : IRequest<bool>
{
    public int BookingId { get; set; }
}
