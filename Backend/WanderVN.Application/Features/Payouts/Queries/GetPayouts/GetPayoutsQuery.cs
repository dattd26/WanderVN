using MediatR;
using WanderVN.Application.Features.Users.Queries.GetUsers;

namespace WanderVN.Application.Features.Payouts.Queries.GetPayouts;

public class GetPayoutsQuery : IRequest<PagedResult<PayoutDto>>
{
    /// Tìm theo tên/email Partner hoặc BookingCode
    public string? Keyword { get; set; }

    /// Pending, Approved, Paid, Rejected
    public string? Status { get; set; }

    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
