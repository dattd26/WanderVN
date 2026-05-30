using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.CompleteBooking;

public class CompleteBookingCommand : IRequest<bool>
{
    public int HotelId { get; set; }
    public int BookingId { get; set; }
}
