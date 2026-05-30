using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.CheckInBooking;

public class CheckInBookingCommand : IRequest<bool>
{
    public int HotelId { get; set; }
    public int BookingId { get; set; }
}
