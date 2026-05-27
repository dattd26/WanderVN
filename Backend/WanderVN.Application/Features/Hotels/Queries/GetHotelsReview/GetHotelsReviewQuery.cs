using MediatR;
using WanderVN.Application.Common.Models;

namespace WanderVN.Application.Features.Hotels.Queries.GetHotelsReview;

public class GetHotelsReviewQuery : IRequest<PagedResult<HotelsReviewDto>>
{
    public int? Status { get; set; } // 0 = Pending, 1 = Approved, 2 = Rejected
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
