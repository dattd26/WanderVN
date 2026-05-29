using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.Home.Queries.GetHomeData;
using WanderVN.Application.Features.Hotels.Queries.SearchHotels;

namespace WanderVN.Application.Features.Home.Queries.GetTravelMoodById;

public class TravelMoodDetailDto
{
    public HomeTravelMoodDto Mood { get; set; } = new();
    public List<SearchHotelsDto> Hotels { get; set; } = new();
}

public record GetTravelMoodByIdQuery(string Id) : IRequest<TravelMoodDetailDto?>;

public class GetTravelMoodByIdQueryHandler : IRequestHandler<GetTravelMoodByIdQuery, TravelMoodDetailDto?>
{
    private readonly IHomeRepository _homeRepository;

    public GetTravelMoodByIdQueryHandler(IHomeRepository homeRepository)
    {
        _homeRepository = homeRepository;
    }

    public async Task<TravelMoodDetailDto?> Handle(GetTravelMoodByIdQuery request, CancellationToken cancellationToken)
    {
        var (mood, hotels) = await _homeRepository.GetTravelMoodDetailAsync(request.Id, cancellationToken);
        
        if (mood == null)
            return null;

        return new TravelMoodDetailDto
        {
            Mood = mood,
            Hotels = hotels
        };
    }
}

