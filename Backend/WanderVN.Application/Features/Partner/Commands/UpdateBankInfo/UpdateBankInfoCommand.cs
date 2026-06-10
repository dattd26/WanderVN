using FluentValidation;
using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.UpdateBankInfo;

public class UpdateBankInfoCommand : IRequest<bool>
{
    public string BankName { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string BankAccountName { get; set; } = string.Empty;
}

public class UpdateBankInfoCommandValidator : AbstractValidator<UpdateBankInfoCommand>
{
    public UpdateBankInfoCommandValidator()
    {
        RuleFor(x => x.BankName)
            .NotEmpty().WithMessage("Tên ngân hàng không được để trống.")
            .MaximumLength(100).WithMessage("Tên ngân hàng không quá 100 ký tự.");

        RuleFor(x => x.BankAccountNumber)
            .NotEmpty().WithMessage("Số tài khoản không được để trống.")
            .MaximumLength(50).WithMessage("Số tài khoản không quá 50 ký tự.");

        RuleFor(x => x.BankAccountName)
            .NotEmpty().WithMessage("Tên chủ tài khoản không được để trống.")
            .MaximumLength(255).WithMessage("Tên chủ tài khoản không quá 255 ký tự.");
    }
}
