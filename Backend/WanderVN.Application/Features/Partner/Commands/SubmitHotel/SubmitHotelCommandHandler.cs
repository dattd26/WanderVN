using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Commands.SubmitHotel;

public class SubmitHotelCommandHandler : IRequestHandler<SubmitHotelCommand, SubmitHotelResponse>
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly ICurrentUserService _currentUser;

    public SubmitHotelCommandHandler(
        IPartnerRepository partnerRepository,
        ICurrentUserService currentUser)
    {
        _partnerRepository = partnerRepository;
        _currentUser = currentUser;
    }

    public async Task<SubmitHotelResponse> Handle(SubmitHotelCommand request, CancellationToken cancellationToken)
    {
        // Lấy PartnerId từ JWT — đảm bảo client không thể submit thay người khác
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực để submit khách sạn.");

        // Validation cơ bản ở Application layer; SP đảm nhiệm validation business (role, policy enum)
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Tên khách sạn không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Address))
            throw new ArgumentException("Địa chỉ khách sạn không được để trống.");
        if (request.StarRating is < 1 or > 5)
            throw new ArgumentException("Số sao phải nằm trong khoảng 1-5.");

        // Chuyển danh sách AmenityId sang chuỗi CSV để SP dùng STRING_SPLIT
        var amenityIdsCsv = request.AmenityIds.Count > 0
            ? string.Join(",", request.AmenityIds)
            : null;

        var result = await _partnerRepository.SubmitHotelAsync(
            partnerId: partnerId,
            name: request.Name.Trim(),
            address: request.Address.Trim(),
            locationId: request.LocationId,
            propertyTypeId: request.PropertyTypeId,
            description: request.Description,
            starRating: request.StarRating,
            latitude: request.Latitude,
            longitude: request.Longitude,
            cancellationPolicy: request.CancellationPolicy?.ToLowerInvariant(),
            amenityIdsCsv: amenityIdsCsv,
            cancellationToken: cancellationToken);

        return new SubmitHotelResponse
        {
            HotelId = result.NewHotelId,
            SubmittedAt = result.SubmittedAt,
            Status = "Pending"
        };
    }
}
