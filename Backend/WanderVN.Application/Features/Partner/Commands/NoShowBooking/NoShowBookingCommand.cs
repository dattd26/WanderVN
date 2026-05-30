using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.NoShowBooking;

public class NoShowBookingCommand : IRequest<bool>
{
    public int HotelId { get; set; }
    public int BookingId { get; set; }
}
