using MediatR;

namespace WanderVN.Application.Features.Roles.Queries.GetRoles;

public class GetRolesQuery : IRequest<List<GetRolesDto>>
{
}
