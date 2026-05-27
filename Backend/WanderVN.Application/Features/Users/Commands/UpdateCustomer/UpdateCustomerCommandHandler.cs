using MediatR;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Users.Commands.UpdateCustomer;

public class UpdateCustomerCommandHandler : IRequestHandler<UpdateCustomerCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCustomerCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDto> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        // Cho phép cập nhật tất cả user (không filter bằng "Customer" nữa) vì có thể đổi Role.
        var user = await _userRepository.GetUserByIdAsync(request.Id, null, cancellationToken);
        
        if (user == null)
            throw new ArgumentException("Không tìm thấy người dùng.");

        if (request.FullName != null)
        {
            user.FullName = string.IsNullOrWhiteSpace(request.FullName) ? null : request.FullName;
        }

        if (request.PhoneNumber != null)
        {
            user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber;
        }

        if (request.AvatarUrl != null)
        {
            // Nếu gửi lên chuỗi rỗng "" hoặc "null" thì xóa ảnh, ngược lại thì cập nhật ảnh mới
            user.AvatarUrl = string.IsNullOrWhiteSpace(request.AvatarUrl) || request.AvatarUrl.Trim().ToLower() == "string" ? null : request.AvatarUrl;
        }
        
        if (request.IsActive.HasValue)
        {
            user.IsActive = request.IsActive.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        if (request.RoleId.HasValue)
        {
            // Các RoleId mặc định: 1 (Partner), 3 (Customer), 4 (Admin) theo cấu trúc đã cung cấp
            user.RoleId = request.RoleId.Value;
            user.Role = null; // Quan trọng: Phải gán Role = null để ngắt liên kết Entity cũ, ép EF Core update theo RoleId mới
        }

        user.UpdatedAt = DateTimeOffset.UtcNow;

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Nạp lại Role để trả về RoleName chính xác
        var updatedUser = await _userRepository.GetUserByIdAsync(request.Id, null, cancellationToken);

        return new UserDto
        {
            Id = updatedUser!.Id,
            Email = updatedUser.Email,
            FullName = updatedUser.FullName,
            PhoneNumber = updatedUser.PhoneNumber,
            AvatarUrl = updatedUser.AvatarUrl,
            RoleName = updatedUser.Role?.Name,
            IsActive = updatedUser.IsActive,
            CreatedAt = updatedUser.CreatedAt
        };
    }
}
