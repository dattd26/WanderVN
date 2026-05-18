using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Features.Auth.Commands;

namespace WanderVN.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginCommand command);
    Task RegisterAsync(RegisterCommand command); 
}