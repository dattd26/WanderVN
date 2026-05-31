using MediatR;
using WanderVN.Application.Features.Payouts.Queries.GetAdminBatches;

namespace WanderVN.Application.Features.Payouts.Queries.GetAdminBatchDetail;

public class GetAdminBatchDetailQuery : IRequest<AdminBatchDto>
{
    public int Id { get; set; }
}
