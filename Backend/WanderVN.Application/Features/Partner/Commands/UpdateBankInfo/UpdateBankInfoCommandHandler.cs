using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Commands.UpdateBankInfo;

public class UpdateBankInfoCommandHandler : IRequestHandler<UpdateBankInfoCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UpdateBankInfoCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateBankInfoCommand request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUserService.UserId;
        if (partnerId == null)
            throw new UnauthorizedAccessException("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");

        var user = await _unitOfWork.Users.GetByIdAsync(partnerId.Value, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy thông tin tài khoản đối tác.");

        user.BankName = request.BankName.Trim();
        user.BankAccountNumber = request.BankAccountNumber.Trim();
        user.BankAccountName = request.BankAccountName.Trim();
        user.BankBin = request.BankBin.Trim();

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
