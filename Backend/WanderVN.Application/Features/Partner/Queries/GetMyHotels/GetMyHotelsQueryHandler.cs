using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Models;
using WanderVN.Application.Features.Partner.DTOs;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Queries.GetMyHotels;

public class GetMyHotelsQueryHandler : IRequestHandler<GetMyHotelsQuery, PagedResult<PartnerHotelDto>>
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly ICurrentUserService _currentUser;

    public GetMyHotelsQueryHandler(
        IPartnerRepository partnerRepository,
        ICurrentUserService currentUser)
    {
        _partnerRepository = partnerRepository;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<PartnerHotelDto>> Handle(GetMyHotelsQuery request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực để lấy danh sách khách sạn.");

        var (hotels, totalCount) = await _partnerRepository.ListMyHotelsAsync(
            partnerId,
            request.Status,
            request.PageNumber,
            request.PageSize,
            cancellationToken
        );

        // Map từ Domain model sang DTO của Application (tiếng Việt)
        var mappedItems = hotels.Select(h => new PartnerHotelDto
        {
            Id = h.Id,
            Name = h.Name,
            Address = h.Address,
            StarRating = h.StarRating,
            Description = h.Description,
            Status = h.Status,
            CancellationPolicy = h.CancellationPolicy,
            RejectReason = h.RejectReason,
            SubmittedAt = h.SubmittedAt,
            ApprovedAt = h.ApprovedAt,
            CreatedAt = h.CreatedAt,
            LocationName = h.LocationName,
            PropertyTypeName = h.PropertyTypeName,
            PropertyTypeCode = h.PropertyTypeCode,
            PrimaryImageUrl = h.PrimaryImageUrl,
            RoomTypeCount = h.RoomTypeCount,
            TotalBookings = h.TotalBookings
        }).ToList();

        return new PagedResult<PartnerHotelDto>(mappedItems, totalCount, request.PageNumber, request.PageSize);
    }
}
