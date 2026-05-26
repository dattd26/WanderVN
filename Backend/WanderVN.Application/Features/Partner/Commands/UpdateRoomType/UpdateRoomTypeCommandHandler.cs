using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Commands.UpdateRoomType;

// Handler xử lý nghiệp vụ cập nhật hạng phòng và tự động điều chỉnh số lượng phòng
public class UpdateRoomTypeCommandHandler : IRequestHandler<UpdateRoomTypeCommand, UpdateRoomTypeResponse>
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly ICurrentUserService _currentUser;

    public UpdateRoomTypeCommandHandler(
        IPartnerRepository partnerRepository,
        ICurrentUserService currentUser)
    {
        _partnerRepository = partnerRepository;
        _currentUser = currentUser;
    }

    public async Task<UpdateRoomTypeResponse> Handle(UpdateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        // Trích xuất PartnerId từ Token
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực để thực hiện chức năng chỉnh sửa hạng phòng.");

        // Xác thực dữ liệu đầu vào (Validation)
        if (request.RoomTypeId <= 0)
            throw new ArgumentException("Id của hạng phòng không hợp lệ.");
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Tên hạng phòng không được phép để trống.");
        if (request.BasePrice <= 0)
            throw new ArgumentException("Giá phòng mỗi đêm phải lớn hơn 0 đồng.");
        if (request.Capacity <= 0)
            throw new ArgumentException("Sức chứa của phòng phải lớn hơn 0 khách.");
        if (request.TotalRooms <= 0)
            throw new ArgumentException("Số lượng phòng trống tối thiểu phải từ 1 phòng trở lên.");

        // Gọi phương thức Repository để thực thi stored procedure cập nhật
        var rowsAffected = await _partnerRepository.UpdateRoomTypeAsync(
            partnerId: partnerId,
            roomTypeId: request.RoomTypeId,
            name: request.Name.Trim(),
            basePrice: request.BasePrice,
            capacity: request.Capacity,
            totalRooms: request.TotalRooms,
            description: request.Description,
            cancellationToken: cancellationToken);

        if (rowsAffected > 0 && request.RatePlans != null && request.RatePlans.Any())
        {
            // Chuyển đổi RatePlanDto sang Domain Model
            var domainRatePlans = request.RatePlans.Select(rp => new PartnerRatePlanModel
            {
                Name = rp.Name,
                PriceMultiplier = rp.PriceMultiplier,
                HasBreakfast = rp.HasBreakfast,
                IsRefundable = rp.IsRefundable
            }).ToList();

            // Gọi Repository để đồng bộ các RatePlans mới bằng Dapper
            await _partnerRepository.SyncRatePlansAsync(request.RoomTypeId, domainRatePlans, cancellationToken);
        }

        return new UpdateRoomTypeResponse
        {
            Success = rowsAffected > 0,
            Message = rowsAffected > 0 ? "Cập nhật hạng phòng di sản thành công." : "Không thể cập nhật hạng phòng hoặc bạn không có quyền thao tác trên cơ sở này."
        };
    }
}
