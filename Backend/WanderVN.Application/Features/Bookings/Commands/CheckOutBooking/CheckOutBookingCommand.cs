using MediatR;

namespace WanderVN.Application.Features.Bookings.Commands.CheckOutBooking;

public class CheckOutBookingCommand : IRequest<bool>
{
    public int BookingId { get; set; }
}
