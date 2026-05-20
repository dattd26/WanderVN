using MediatR;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Auth.Commands;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Unit>
{
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterCommandHandler(IAuthRepository authRepository, IUnitOfWork unitOfWork)
    {
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (!await _authRepository.IsEmailUniqueAsync(request.Email))
            throw new ArgumentException("Email đã được sử dụng.");

        var role = await _authRepository.GetRoleByNameAsync("Customer");
        if (role == null)
            throw new InvalidOperationException("Role 'Customer' không tồn tại trong hệ thống. Vui lòng kiểm tra dữ liệu hoặc thêm role này vào database.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new WanderVN.Domain.Entities.Users
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            RoleId = role.Id,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _authRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
