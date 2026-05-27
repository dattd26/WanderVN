using MediatR;

namespace WanderVN.Application.Features.Users.Queries.GetUserById;

public class GetUserByIdQuery : IRequest<UserDetailsDto>
{
    public int Id { get; }
    public string? RoleName { get; }

    public GetUserByIdQuery(int id, string? roleName = null)
    {
        Id = id;
        RoleName = roleName;
    }
}
