using MediatR;
using WanderVN.Application.Features.Users.Queries.GetUsers;

namespace WanderVN.Application.Features.Payouts.Queries.GetAdminBatches;

public class GetAdminBatchesQuery : IRequest<PagedResult<AdminBatchDto>>
{
    public string? PartnerKeyword { get; set; }
    public string? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
