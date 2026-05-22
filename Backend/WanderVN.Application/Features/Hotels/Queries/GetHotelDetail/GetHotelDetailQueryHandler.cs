using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Hotels.Queries.GetHotelDetail;

public class GetHotelDetailQueryHandler : IRequestHandler<GetHotelDetailQuery, HotelDetailDto?>
{
    private readonly IHotelRepository _hotelRepository;

    public GetHotelDetailQueryHandler(IHotelRepository hotelRepository)
    {
        _hotelRepository = hotelRepository;
    }

    public async Task<HotelDetailDto?> Handle(GetHotelDetailQuery request, CancellationToken cancellationToken)
    {
        return await _hotelRepository.GetHotelDetailAsync(request.HotelId, cancellationToken);
    }
}
