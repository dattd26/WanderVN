using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Home.Queries.GetHomeData;

public record GetHomeWeekendEscapesQuery(string Origin) : IRequest<List<HomeWeekendEscapeDto>>;

public class GetHomeWeekendEscapesQueryHandler : IRequestHandler<GetHomeWeekendEscapesQuery, List<HomeWeekendEscapeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHomeWeekendEscapesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HomeWeekendEscapeDto>> Handle(GetHomeWeekendEscapesQuery request, CancellationToken cancellationToken)
    {
        var origin = request.Origin?.ToLower() ?? "hanoi";

        return await _context.HomeWeekendEscapes
            .Include(e => e.Location)
            .Where(e => e.Origin.ToLower() == origin)
            .OrderBy(e => e.SortOrder)
            .Select(e => new HomeWeekendEscapeDto
            {
                Id = e.Id,
                Origin = e.Origin,
                LocationId = e.LocationId,
                LocationName = e.Location != null ? e.Location.Name : string.Empty,
                Duration = e.Duration,
                Description = e.Description,
                ImageUrl = e.ImageUrl
            })
            .ToListAsync(cancellationToken);
    }
}
