using MediatR;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Commands.CreateFlightBooking;

public class CreateFlightBookingCommand : IRequest<FlightBookingResponse>
{
    public CreateFlightBookingRequest Request { get; set; } = new();
}
