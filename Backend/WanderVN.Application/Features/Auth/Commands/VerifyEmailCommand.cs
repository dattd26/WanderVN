using MediatR;

namespace WanderVN.Application.Features.Auth.Commands;

public class VerifyEmailCommand : IRequest<Unit>
{
    public string Token { get; set; } = string.Empty;
}
