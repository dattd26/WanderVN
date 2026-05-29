using MediatR;

namespace WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelReviewDetail;

public record GetHotelReviewDetailQuery(int HotelId) : IRequest<AdminHotelDetailDto?>;
