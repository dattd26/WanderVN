using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Features.Partner.Commands.AddRoomType;

// Handler xử lý nghiệp vụ thêm hạng phòng mới của đối tác
public class AddRoomTypeCommandHandler : IRequestHandler<AddRoomTypeCommand, AddRoomTypeResponse>
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _dbContext;

    public AddRoomTypeCommandHandler(
        IPartnerRepository partnerRepository,
        ICurrentUserService currentUser,
        IApplicationDbContext dbContext)
    {
        _partnerRepository = partnerRepository;
        _currentUser = currentUser;
        _dbContext = dbContext;
    }

    public async Task<AddRoomTypeResponse> Handle(AddRoomTypeCommand request, CancellationToken cancellationToken)
    {
        // Trích xuất PartnerId (UserId) từ thông tin người dùng hiện tại trong JWT Token
        var partnerId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("Yêu cầu xác thực để thực hiện chức năng thêm hạng phòng.");

        // Kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation)
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Tên hạng phòng không được phép để trống.");
        if (request.BasePrice <= 0)
            throw new ArgumentException("Giá phòng mỗi đêm phải lớn hơn 0 đồng.");
        if (request.Capacity <= 0)
            throw new ArgumentException("Sức chứa của phòng phải lớn hơn 0 khách.");
        if (request.TotalRooms <= 0)
            throw new ArgumentException("Số lượng phòng trống tối thiểu phải từ 1 phòng trở lên.");
        if (request.RatePlans == null || !request.RatePlans.Any())
            throw new ArgumentException("Phải cung cấp ít nhất một gói giá (Rate Plan) cho hạng phòng này.");

        // Thực thi nghiệp vụ qua tầng Repository và cơ sở dữ liệu
        var roomTypeId = await _partnerRepository.AddRoomTypeAsync(
            partnerId: partnerId,
            hotelId: request.HotelId,
            name: request.Name.Trim(),
            basePrice: request.BasePrice,
            capacity: request.Capacity,
            totalRooms: request.TotalRooms,
            description: request.Description,
            cancellationToken: cancellationToken);

        // Lưu danh sách RatePlans vào db
        var ratePlansToInsert = request.RatePlans.Select(rp => new RatePlans
        {
            RoomTypeId = roomTypeId,
            Name = rp.Name,
            PriceMultiplier = rp.PriceMultiplier,
            HasBreakfast = rp.HasBreakfast,
            IsRefundable = rp.IsRefundable
        }).ToList();

        _dbContext.RatePlans.AddRange(ratePlansToInsert);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AddRoomTypeResponse
        {
            RoomTypeId = roomTypeId,
            Status = "Created"
        };
    }
}
