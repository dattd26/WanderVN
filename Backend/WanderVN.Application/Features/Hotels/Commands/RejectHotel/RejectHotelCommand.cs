using MediatR;

namespace WanderVN.Application.Features.Hotels.Commands.RejectHotel;

public class RejectHotelCommand : IRequest<bool>
{
    public int HotelId { get; set; }
    public string RejectReason { get; set; } = string.Empty;
}
