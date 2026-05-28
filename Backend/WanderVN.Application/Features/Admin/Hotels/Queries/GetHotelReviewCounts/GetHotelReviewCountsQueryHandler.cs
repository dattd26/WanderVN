using MediatR;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelReviewCounts;

public class GetHotelReviewCountsQueryHandler
    : IRequestHandler<GetHotelReviewCountsQuery, HotelReviewCountsDto>
{
    private readonly IHotelsRepository _hotelsRepository;

    public GetHotelReviewCountsQueryHandler(IHotelsRepository hotelsRepository)
    {
        _hotelsRepository = hotelsRepository;
    }

    public async Task<HotelReviewCountsDto> Handle(
        GetHotelReviewCountsQuery request, CancellationToken cancellationToken)
    {
        var (pending, approved, rejected) = await _hotelsRepository
            .GetReviewCountsAsync(cancellationToken);
        return new HotelReviewCountsDto
        {
            Pending = pending,
            Approved = approved,
            Rejected = rejected,
        };
    }
}
