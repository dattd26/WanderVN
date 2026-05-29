using MediatR;

namespace WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelReviewCounts;

public record GetHotelReviewCountsQuery : IRequest<HotelReviewCountsDto>;
