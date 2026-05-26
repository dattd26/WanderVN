using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Home.Queries.GetHomeData;

public record GetHomeTravelMoodsQuery : IRequest<List<HomeTravelMoodDto>>;

public class GetHomeTravelMoodsQueryHandler : IRequestHandler<GetHomeTravelMoodsQuery, List<HomeTravelMoodDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHomeTravelMoodsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HomeTravelMoodDto>> Handle(GetHomeTravelMoodsQuery request, CancellationToken cancellationToken)
    {
        return await _context.HomeTravelMoods
            .OrderBy(m => m.SortOrder)
            .Select(m => new HomeTravelMoodDto
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                IconName = m.IconName,
                ImageUrl = m.ImageUrl,
                QueryString = m.QueryString
            })
            .ToListAsync(cancellationToken);
    }
}

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

public record GetHomeStayCollectionsQuery : IRequest<List<HomeStayCollectionDto>>;

public class GetHomeStayCollectionsQueryHandler : IRequestHandler<GetHomeStayCollectionsQuery, List<HomeStayCollectionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHomeStayCollectionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HomeStayCollectionDto>> Handle(GetHomeStayCollectionsQuery request, CancellationToken cancellationToken)
    {
        return await _context.HomeStayCollections
            .OrderBy(c => c.SortOrder)
            .Select(c => new HomeStayCollectionDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                StaysCount = c.StaysCount,
                QueryString = c.QueryString
            })
            .ToListAsync(cancellationToken);
    }
}
