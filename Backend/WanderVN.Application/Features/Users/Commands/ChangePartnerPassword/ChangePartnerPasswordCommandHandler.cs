using MediatR;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Users.Commands.ChangePartnerPassword;

public class ChangePartnerPasswordCommandHandler : IRequestHandler<ChangePartnerPasswordCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ChangePartnerPasswordCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ChangePartnerPasswordCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword))
            throw new ArgumentException("Mật khẩu mới không được để trống.");

        if (request.NewPassword.Length < 6)
            throw new ArgumentException("Mật khẩu phải có ít nhất 6 ký tự.");

        var user = await _userRepository.GetUserByIdAsync(request.Id, "Partner", cancellationToken);

        if (user == null)
            throw new ArgumentException("Không tìm thấy đối tác (Partner) với ID này.");

        if (!string.IsNullOrEmpty(user.PasswordHash) &&
            BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            throw new ArgumentException("Mật khẩu mới trùng với mật khẩu cũ.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTimeOffset.UtcNow;

        _userRepository.Update(user);
        var result = await _unitOfWork.SaveChangesAsync(cancellationToken);
        return result > 0;
    }
}
