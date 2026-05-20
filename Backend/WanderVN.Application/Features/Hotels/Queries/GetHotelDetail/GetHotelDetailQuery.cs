using MediatR;

namespace WanderVN.Application.Features.Hotels.Queries.GetHotelDetail;

public class GetHotelDetailQuery : IRequest<HotelDetailDto?>
{
    public int HotelId { get; set; }
}
