using AutoMapper;
using WanderVN.Application.DTOs.Users;
using WanderVN.Application.DTOs.Roles;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Mappings;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        // Users
        CreateMap<Users, UserResponseDto>().ReverseMap();
        CreateMap<UserRequestDto, Users>();
        CreateMap<UserUpdateDto, Users>().ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Roles
        CreateMap<Roles, RoleResponseDto>().ReverseMap();
        CreateMap<RoleRequestDto, Roles>();
    }
}
