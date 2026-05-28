using MediatR;
using WanderVN.Application.Common.Models;

namespace WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelsForReview;

public class GetHotelsForReviewQuery : IRequest<PagedResult<AdminHotelListItemDto>>
{
    public int? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
