using MediatR;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Commands.CreateHotelBooking;

public class CreateHotelBookingCommand : IRequest<HotelBookingResponse>
{
    public CreateHotelBookingRequest Request { get; set; } = new CreateHotelBookingRequest();
}
