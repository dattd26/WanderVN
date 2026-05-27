using MediatR;

namespace WanderVN.Application.Features.Hotels.Commands.ApproveHotel;

public class ApproveHotelCommand : IRequest<bool>
{
    public int HotelId { get; set; }
}
