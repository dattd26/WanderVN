using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.CheckOutBooking;

public class CheckOutBookingCommand : IRequest<bool>
{
    public int HotelId { get; set; }
    public int BookingId { get; set; }
}
