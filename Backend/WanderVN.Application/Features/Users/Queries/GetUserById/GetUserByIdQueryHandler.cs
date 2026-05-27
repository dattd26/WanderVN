using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Users.Queries.GetUserById;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDetailsDto>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDetailsDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetUserByIdAsync(request.Id, request.RoleName, cancellationToken);

        if (user == null)
        {
            var roleMsg = !string.IsNullOrEmpty(request.RoleName) ? $" có vai trò '{request.RoleName}'" : "";
            throw new KeyNotFoundException($"Không tìm thấy người dùng với ID '{request.Id}'{roleMsg}.");
        }

        var detailsDto = new UserDetailsDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            RoleName = user.Role?.Name,
            Hotels = user.Hotels?.Select(h => new UserHotelDto
            {
                Id = h.Id,
                Name = h.Name,
                Address = h.Address,
                StarRating = h.StarRating
            }).ToList()
        };

        return detailsDto;
    }
}
