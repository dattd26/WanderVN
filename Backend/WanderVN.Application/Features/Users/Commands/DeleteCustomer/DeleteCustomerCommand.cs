using MediatR;

namespace WanderVN.Application.Features.Users.Commands.DeleteCustomer;

public class DeleteCustomerCommand : IRequest<bool>
{
    public int Id { get; set; }

    public DeleteCustomerCommand(int id)
    {
        Id = id;
    }
}