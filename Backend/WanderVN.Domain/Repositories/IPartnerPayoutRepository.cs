using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories;

public interface IPartnerPayoutRepository : IGenericRepository<PartnerPayouts>
{
    Task<(IEnumerable<PartnerPayouts> Items, int TotalCount)> GetPagedPayoutsAsync(
        string? partnerKeyword,
        string? status,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<PartnerPayouts?> GetPayoutDetailsByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<(decimal TotalNetPending, decimal TotalCommission, decimal TotalRevenue, int ActivePartners)> GetPayoutStatsAsync(
        CancellationToken cancellationToken = default);
}
