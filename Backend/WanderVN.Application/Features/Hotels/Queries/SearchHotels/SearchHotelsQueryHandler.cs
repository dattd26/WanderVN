using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Hotels.Queries.SearchHotels;

/// <summary>
/// Handler xử lý nghiệp vụ tìm kiếm khách sạn ở tầng Application.
/// </summary>
public class SearchHotelsQueryHandler : IRequestHandler<SearchHotelsQuery, List<SearchHotelsDto>>
{
    private readonly IHotelRepository _hotelRepository;

    public SearchHotelsQueryHandler(IHotelRepository hotelRepository)
    {
        _hotelRepository = hotelRepository;
    }

    public async Task<List<SearchHotelsDto>> Handle(SearchHotelsQuery request, CancellationToken cancellationToken)
    {
        return await _hotelRepository.SearchHotelsAsync(request, cancellationToken);
    }
}
