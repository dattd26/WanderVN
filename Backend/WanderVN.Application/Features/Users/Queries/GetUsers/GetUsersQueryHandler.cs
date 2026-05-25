using MediatR;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Users.Queries.GetUsers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PagedResult<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PagedResult<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(request.PageNumber, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (users, totalItems) = await _userRepository.GetPagedUsersAsync(
            request.FullName,
            request.Email,
            request.PhoneNumber,
            request.RoleName,
            request.IsActive,
            pageNumber,
            pageSize,
            cancellationToken);

        var userDtos = users.Select(user => new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            RoleName = user.Role?.Name,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        }).ToList();

        return new PagedResult<UserDto>(userDtos, totalItems, pageNumber, pageSize);
    }
}
