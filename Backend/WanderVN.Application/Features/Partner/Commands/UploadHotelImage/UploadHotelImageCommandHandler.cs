using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Commands.UploadHotelImage;

public class UploadHotelImageCommandHandler : IRequestHandler<UploadHotelImageCommand, UploadHotelImageResponse>
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly IMediaStorageService _mediaStorage;
    private readonly ICurrentUserService _currentUser;

    public UploadHotelImageCommandHandler(
        IPartnerRepository partnerRepository,
        IMediaStorageService mediaStorage,
        ICurrentUserService currentUser)
    {
        _partnerRepository = partnerRepository;
        _mediaStorage = mediaStorage;
        _currentUser = currentUser;
    }

    public async Task<UploadHotelImageResponse> Handle(UploadHotelImageCommand request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực để upload ảnh khách sạn.");

        if (request.HotelId <= 0)
            throw new ArgumentException("HotelId không hợp lệ.");
        if (request.FileStream == Stream.Null || string.IsNullOrWhiteSpace(request.FileName))
            throw new ArgumentException("File ảnh không hợp lệ.");

        // 1. Upload file lên Cloudinary trước → lấy SecureUrl + PublicId
        var uploaded = await _mediaStorage.UploadImageAsync(
            request.FileStream,
            request.FileName,
            folder: $"wandervn/hotels/{request.HotelId}",
            cancellationToken: cancellationToken);

        // 2. Ghi metadata vào DB qua SP — SP cũng kiểm tra ownership (OwnerId == partnerId)
        //    Nếu SP raise 403, cần rollback ảnh đã upload Cloudinary để tránh rác.
        int imageId;
        try
        {
            imageId = await _partnerRepository.AddHotelImageAsync(
                partnerId: partnerId,
                hotelId: request.HotelId,
                imageUrl: uploaded.SecureUrl,
                publicId: uploaded.PublicId,
                isPrimary: request.IsPrimary,
                cancellationToken: cancellationToken);
        }
        catch
        {
            // Rollback: xóa ảnh khỏi Cloudinary nếu DB insert lỗi (ownership fail, hotel không tồn tại...)
            await _mediaStorage.DeleteImageAsync(uploaded.PublicId, CancellationToken.None);
            throw;
        }

        return new UploadHotelImageResponse
        {
            ImageId = imageId,
            ImageUrl = uploaded.SecureUrl,
            PublicId = uploaded.PublicId,
            IsPrimary = request.IsPrimary
        };
    }
}
