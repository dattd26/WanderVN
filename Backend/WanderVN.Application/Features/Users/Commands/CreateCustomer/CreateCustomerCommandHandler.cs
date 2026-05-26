using MediatR;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Users.Commands.CreateCustomer;

public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, UserDto>
{
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCustomerCommandHandler(IAuthRepository authRepository, IUnitOfWork unitOfWork)
    {
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDto> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        if (!await _authRepository.IsEmailUniqueAsync(request.Email))
            throw new ArgumentException("Email đã được sử dụng.");

        var role = await _authRepository.GetRoleByNameAsync("Customer");
        if (role == null)
            throw new InvalidOperationException("Role 'Customer' không tồn tại trong hệ thống.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new WanderVN.Domain.Entities.Users
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            AvatarUrl = request.AvatarUrl,
            RoleId = role.Id,
            IsActive = request.IsActive,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            RoleName = role.Name,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
