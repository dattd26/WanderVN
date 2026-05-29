using MediatR;
using WanderVN.Application.Common.Models;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelsForReview;

public class GetHotelsForReviewQueryHandler
    : IRequestHandler<GetHotelsForReviewQuery, PagedResult<AdminHotelListItemDto>>
{
    private readonly IHotelsRepository _hotelsRepository;

    public GetHotelsForReviewQueryHandler(IHotelsRepository hotelsRepository)
    {
        _hotelsRepository = hotelsRepository;
    }

    public async Task<PagedResult<AdminHotelListItemDto>> Handle(
        GetHotelsForReviewQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

        var (hotels, total) = await _hotelsRepository.ListForReviewAsync(
            request.Status, pageNumber, pageSize, cancellationToken);

        var items = hotels.Select(h => new AdminHotelListItemDto
        {
            Id = h.Id,
            Name = h.Name,
            Address = h.Address,
            Status = h.Status,
            RejectReason = h.RejectReason,
            SubmittedAt = h.SubmittedAt,
            ApprovedAt = h.ApprovedAt,
            CreatedAt = h.CreatedAt,
            StarRating = h.StarRating,
            PropertyTypeName = h.PropertyType?.Name,
            PropertyTypeCode = h.PropertyType?.Code,
            LocationName = h.Location?.Name,
            PrimaryImageUrl = h.HotelImages
                .OrderByDescending(i => i.IsPrimary == true)
                .Select(i => i.ImageUrl)
                .FirstOrDefault(),
            OwnerName = h.Owner?.FullName,
            OwnerEmail = h.Owner?.Email,
        }).ToList();

        return new PagedResult<AdminHotelListItemDto>(items, total, pageNumber, pageSize);
    }
}
