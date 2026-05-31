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

    Task<(IEnumerable<PartnerPayouts> Items, int TotalCount)> GetPartnerPagedPayoutsAsync(
        int partnerId,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<(decimal GrossTotal, decimal CommissionTotal, decimal NetTotal, decimal PendingBalance, decimal PaidThisMonth, decimal CommissionRate)> GetPartnerSummaryStatsAsync(
        int partnerId,
        CancellationToken cancellationToken = default);

    Task<(IEnumerable<PayoutBatches> Items, int TotalCount)> GetPartnerPagedBatchesAsync(
        int partnerId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<PartnerPayouts>> GetUnbatchedPendingPayoutsAsync(
        int partnerId,
        CancellationToken cancellationToken = default);

    Task<(IEnumerable<PayoutBatches> Items, int TotalCount)> GetAdminPagedBatchesAsync(
        string? partnerKeyword,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<PayoutBatches?> GetBatchDetailsByIdAsync(
        int id,
        CancellationToken cancellationToken = default);
}

