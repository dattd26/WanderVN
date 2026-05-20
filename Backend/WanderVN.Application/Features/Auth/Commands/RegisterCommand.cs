using MediatR;

namespace WanderVN.Application.Features.Auth.Commands;

public class RegisterCommand : IRequest<Unit>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}