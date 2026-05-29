using MediatR;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelReviewDetail;

public class GetHotelReviewDetailQueryHandler
    : IRequestHandler<GetHotelReviewDetailQuery, AdminHotelDetailDto?>
{
    private readonly IHotelsRepository _hotelsRepository;

    public GetHotelReviewDetailQueryHandler(IHotelsRepository hotelsRepository)
    {
        _hotelsRepository = hotelsRepository;
    }

    public async Task<AdminHotelDetailDto?> Handle(
        GetHotelReviewDetailQuery request, CancellationToken cancellationToken)
    {
        var h = await _hotelsRepository.GetForReviewAsync(request.HotelId, cancellationToken);
        if (h is null) return null;

        return new AdminHotelDetailDto
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
            OwnerPhone = h.Owner?.PhoneNumber,
            Description = h.Description,
            CancellationPolicy = h.CancellationPolicy,
            ImageUrls = h.HotelImages
                .OrderByDescending(i => i.IsPrimary == true)
                .Select(i => i.ImageUrl)
                .ToList(),
            RoomTypes = h.RoomTypes.Select(r => new AdminHotelRoomTypeDto
            {
                Id = r.Id,
                Name = r.Name,
                BasePrice = r.BasePrice,
                Capacity = r.Capacity,
                TotalRooms = r.TotalRooms,
                Description = r.Description,
            }).ToList(),
        };
    }
}
