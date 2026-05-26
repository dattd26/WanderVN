using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Commands.UploadRoomTypeImage;

public class UploadRoomTypeImageCommandHandler : IRequestHandler<UploadRoomTypeImageCommand, UploadRoomTypeImageResponse>
{
    private readonly IMediaStorageService _mediaStorage;
    private readonly IPartnerRepository _partnerRepository;
    private readonly ICurrentUserService _currentUser;

    public UploadRoomTypeImageCommandHandler(
        IMediaStorageService mediaStorage,
        IPartnerRepository partnerRepository,
        ICurrentUserService currentUser)
    {
        _mediaStorage = mediaStorage;
        _partnerRepository = partnerRepository;
        _currentUser = currentUser;
    }

    public async Task<UploadRoomTypeImageResponse> Handle(UploadRoomTypeImageCommand request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực để upload ảnh hạng phòng.");

        // Kiểm tra quyền sở hữu bằng Dapper qua Repository
        var isOwned = await _partnerRepository.IsRoomTypeOwnedByPartnerAsync(
            request.RoomTypeId, request.HotelId, partnerId, cancellationToken);

        if (!isOwned)
            throw new UnauthorizedAccessException("Bạn không có quyền upload ảnh cho hạng phòng này.");

        // Upload Cloudinary
        var uploaded = await _mediaStorage.UploadImageAsync(
            request.FileStream,
            request.FileName,
            folder: null,
            cancellationToken: cancellationToken);

        try
        {
            // Lưu bản ghi ảnh hạng phòng thông qua repository sử dụng Dapper
            var imageId = await _partnerRepository.AddRoomTypeImageAsync(
                request.RoomTypeId, uploaded.SecureUrl, cancellationToken);

            return new UploadRoomTypeImageResponse
            {
                ImageId = imageId,
                ImageUrl = uploaded.SecureUrl,
                PublicId = uploaded.PublicId
            };
        }
        catch (Exception)
        {
            await _mediaStorage.DeleteImageAsync(uploaded.PublicId, CancellationToken.None);
            throw;
        }
    }
}
