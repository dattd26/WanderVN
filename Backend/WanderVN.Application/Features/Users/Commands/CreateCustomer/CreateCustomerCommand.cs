using MediatR;
using WanderVN.Application.Features.Users.Queries.GetUsers;

namespace WanderVN.Application.Features.Users.Commands.CreateCustomer;

public class CreateCustomerCommand : IRequest<UserDto>
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
}
