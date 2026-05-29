using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Home.Queries.GetHomeData;

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
