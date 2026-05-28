using MediatR;
using WanderVN.Domain.Enums;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Users.Commands.ApprovePartner;

public class ApprovePartnerCommandHandler : IRequestHandler<ApprovePartnerCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApprovePartnerCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ApprovePartnerCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetUserByIdAsync(request.Id, "Partner", cancellationToken);

        if (user == null)
            throw new ArgumentException("Không tìm thấy đối tác (Partner) với ID này.");

        if (user.Status != (int)UserStatus.Pending)
            throw new ArgumentException("Hồ sơ không ở trạng thái chờ duyệt.");

        user.Status = (int)UserStatus.Active;
        user.IsActive = true;
        user.RejectReason = null;
        user.ApprovedAt = DateTimeOffset.UtcNow;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        _userRepository.Update(user);
        var result = await _unitOfWork.SaveChangesAsync(cancellationToken);
        return result > 0;
    }
}
