using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Users.Queries.GetUsers;

public class GetUsersQuery : IRequest<PagedResult<UserDto>>
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
