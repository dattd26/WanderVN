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
