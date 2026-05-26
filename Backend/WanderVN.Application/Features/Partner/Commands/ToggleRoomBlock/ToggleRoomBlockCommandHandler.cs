using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Commands.ToggleRoomBlock;

public class ToggleRoomBlockCommandHandler : IRequestHandler<ToggleRoomBlockCommand, ToggleRoomBlockResponse>
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly ICurrentUserService _currentUser;

    public ToggleRoomBlockCommandHandler(
        IPartnerRepository partnerRepository,
        ICurrentUserService currentUser)
    {
        _partnerRepository = partnerRepository;
        _currentUser = currentUser;
    }

    public async Task<ToggleRoomBlockResponse> Handle(ToggleRoomBlockCommand request, CancellationToken cancellationToken)
    {
        // 1. Lấy PartnerId của tài khoản đăng nhập từ JWT Token thông qua CurrentUserService
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực tài khoản đối tác.");

        // 2. Kiểm tra tính hợp lệ của tham số Id hạng phòng
        if (request.RoomTypeId <= 0)
            throw new ArgumentException("Id hạng phòng không hợp lệ.");

        // 3. Phân tích định dạng ngày chặn phòng (blockDate: yyyy-MM-dd)
        if (!DateTime.TryParseExact(request.BlockDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var parsedDate))
        {
            throw new ArgumentException("Định dạng ngày chặn không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd.");
        }

        var blockDateOnly = DateOnly.FromDateTime(parsedDate);

        // 4. Validate hành động chặn/gỡ chặn
        var actionNormalized = request.Action.ToUpper().Trim();
        if (actionNormalized != "BLOCK" && actionNormalized != "UNBLOCK")
        {
            throw new ArgumentException("Hành động không hợp lệ. Chỉ chấp nhận 'BLOCK' hoặc 'UNBLOCK'.");
        }

        // 5. Thực thi gọi tầng Database thực tế
        var affectedRows = await _partnerRepository.ToggleRoomBlockAsync(
            partnerId: partnerId,
            roomTypeId: request.RoomTypeId,
            blockDate: blockDateOnly,
            action: actionNormalized,
            cancellationToken: cancellationToken);

        return new ToggleRoomBlockResponse
        {
            Success = affectedRows > 0,
            Message = actionNormalized == "BLOCK" 
                ? "Đã chặn phòng khả dụng ngày này thành công!" 
                : "Đã gỡ chặn phòng khả dụng ngày này thành công!"
        };
    }
}
