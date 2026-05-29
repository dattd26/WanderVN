using MediatR;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Auth.Commands;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly IAuthRepository _authRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ChangePasswordCommandHandler(IAuthRepository authRepository, IUnitOfWork unitOfWork)
    {
        _authRepository = authRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _authRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new System.Exception("Người dùng không tồn tại.");
        }

        bool isOldPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash);
        if (!isOldPasswordCorrect)
        {
            throw new System.ArgumentException("Mật khẩu hiện tại không chính xác.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _authRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
