using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Features.Partner.Commands.UpdateRatePlans;

public class UpdateRatePlansCommandHandler : IRequestHandler<UpdateRatePlansCommand, UpdateRatePlansResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUser;

    public UpdateRatePlansCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    public async Task<UpdateRatePlansResponse> Handle(UpdateRatePlansCommand request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực để thực hiện chức năng này.");

        if (request.RatePlans == null || !request.RatePlans.Any())
        {
            return new UpdateRatePlansResponse { Success = false, Message = "Danh sách rate plans không được để trống." };
        }

        // Kiểm tra xem RoomType có tồn tại và thuộc về khách sạn của Partner này không
        var roomType = await _dbContext.RoomTypes
            .Include(rt => rt.Hotel)
            .FirstOrDefaultAsync(rt => rt.Id == request.RoomTypeId && rt.HotelId == request.HotelId, cancellationToken);

        if (roomType == null || roomType.Hotel == null || roomType.Hotel.OwnerId != partnerId)
        {
            return new UpdateRatePlansResponse { Success = false, Message = "Không tìm thấy hạng phòng hoặc bạn không có quyền chỉnh sửa." };
        }

        // Lấy danh sách RatePlans hiện tại
        var existingRatePlans = await _dbContext.RatePlans
            .Where(rp => rp.RoomTypeId == request.RoomTypeId)
            .ToListAsync(cancellationToken);

        // Xoá danh sách cũ
        _dbContext.RatePlans.RemoveRange(existingRatePlans);

        // Thêm danh sách mới
        var newRatePlans = request.RatePlans.Select(rp => new RatePlans
        {
            RoomTypeId = request.RoomTypeId,
            Name = rp.Name,
            PriceMultiplier = rp.PriceMultiplier,
            HasBreakfast = rp.HasBreakfast,
            IsRefundable = rp.IsRefundable
        }).ToList();

        _dbContext.RatePlans.AddRange(newRatePlans);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new UpdateRatePlansResponse
        {
            Success = true,
            Message = "Cập nhật hệ số giá và Rate Plans thành công."
        };
    }
}
