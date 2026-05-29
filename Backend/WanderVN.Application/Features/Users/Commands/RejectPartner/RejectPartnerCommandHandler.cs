using MediatR;
using WanderVN.Domain.Enums;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Users.Commands.RejectPartner;

public class RejectPartnerCommandHandler : IRequestHandler<RejectPartnerCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RejectPartnerCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RejectPartnerCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RejectReason))
            throw new ArgumentException("Vui lòng nhập lý do từ chối.");

        var user = await _userRepository.GetUserByIdAsync(request.Id, "Partner", cancellationToken);

        if (user == null)
            throw new ArgumentException("Không tìm thấy đối tác (Partner) với ID này.");

        if (user.Status != (int)UserStatus.Pending)
            throw new ArgumentException("Hồ sơ không ở trạng thái chờ duyệt.");

        user.Status = (int)UserStatus.Rejected;
        user.IsActive = false;
        user.RejectReason = request.RejectReason.Trim();
        user.UpdatedAt = DateTimeOffset.UtcNow;

        _userRepository.Update(user);
        var result = await _unitOfWork.SaveChangesAsync(cancellationToken);
        return result > 0;
    }
}
