using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Commands.DeleteRoomType;

// Handler xử lý nghiệp vụ xóa hạng phòng của đối tác
public class DeleteRoomTypeCommandHandler : IRequestHandler<DeleteRoomTypeCommand, DeleteRoomTypeResponse>
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly ICurrentUserService _currentUser;

    public DeleteRoomTypeCommandHandler(
        IPartnerRepository partnerRepository,
        ICurrentUserService currentUser)
    {
        _partnerRepository = partnerRepository;
        _currentUser = currentUser;
    }

    public async Task<DeleteRoomTypeResponse> Handle(DeleteRoomTypeCommand request, CancellationToken cancellationToken)
    {
        // Trích xuất PartnerId từ JWT Token thông qua CurrentUserService
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực để thực hiện chức năng xóa hạng phòng.");

        // Kiểm tra tính hợp lệ của tham số Id hạng phòng
        if (request.RoomTypeId <= 0)
            throw new ArgumentException("Id của hạng phòng cần xóa không hợp lệ.");

        // Thực thi cuộc gọi xuống tầng Database để xóa hạng phòng
        var rowsAffected = await _partnerRepository.DeleteRoomTypeAsync(
            partnerId: partnerId,
            roomTypeId: request.RoomTypeId,
            cancellationToken: cancellationToken);

        return new DeleteRoomTypeResponse
        {
            Success = rowsAffected > 0,
            Message = rowsAffected > 0 ? "Xóa hạng phòng di sản thành công." : "Không tìm thấy hạng phòng hoặc bạn không có quyền thao tác trên hạng phòng này."
        };
    }
}
