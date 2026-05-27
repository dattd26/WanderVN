using MediatR;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Roles.Queries.GetRoles;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, List<GetRolesDto>>
{
    private readonly IRoleRepository _roleRepository;

    public GetRolesQueryHandler(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    public async Task<List<GetRolesDto>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        var roles = await _roleRepository.GetAllAsync(cancellationToken);

        return roles.Select(r => new GetRolesDto
        {
            Id = r.Id,
            Name = r.Name,
        }).ToList();
    }
}
