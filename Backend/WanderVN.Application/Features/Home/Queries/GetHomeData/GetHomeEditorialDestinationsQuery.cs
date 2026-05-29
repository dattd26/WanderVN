using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Home.Queries.GetHomeData;

public record GetHomeEditorialDestinationsQuery : IRequest<List<HomeEditorialDestinationDto>>;

public class GetHomeEditorialDestinationsQueryHandler : IRequestHandler<GetHomeEditorialDestinationsQuery, List<HomeEditorialDestinationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHomeEditorialDestinationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HomeEditorialDestinationDto>> Handle(GetHomeEditorialDestinationsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.HomeEditorialDestinations
            .Include(d => d.Location)
            .OrderBy(d => d.SortOrder)
            .ToListAsync(cancellationToken);

        return items.Select(d => new HomeEditorialDestinationDto
        {
            Id = d.Id,
            LocationId = d.LocationId,
            LocationName = d.Location != null ? d.Location.Name : string.Empty,
            Tags = d.Tags.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).ToList(),
            ImageUrl = d.ImageUrl,
            BestTime = d.BestTime,
            Experience = d.Experience,
            StaysCount = d.StaysCount,
            IsLarge = d.IsLarge
        }).ToList();
    }
}
