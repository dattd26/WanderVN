using MediatR;
using WanderVN.Application.Features.Users.Queries.GetUsers;
using System.Text.Json.Serialization;

namespace WanderVN.Application.Features.Users.Commands.UpdateCustomer;

public class UpdateCustomerCommand : IRequest<UserDto>
{
    [JsonIgnore]
    public int Id { get; set; }
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool? IsActive { get; set; }
    public string? Password { get; set; }
    public int? RoleId { get; set; }
}
