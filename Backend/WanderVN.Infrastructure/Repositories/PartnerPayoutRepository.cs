using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class PartnerPayoutRepository : GenericRepository<PartnerPayouts>, IPartnerPayoutRepository
{
    public PartnerPayoutRepository(WanderVNDbContext context) : base(context)
    {
    }

    public async Task<(IEnumerable<PartnerPayouts> Items, int TotalCount)> GetPagedPayoutsAsync(
        string? partnerKeyword,
        string? status,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.PartnerPayouts
            .AsNoTracking()
            .Include(p => p.Partner)
            .Include(p => p.Booking)
            .AsQueryable();

        // Tìm theo tên/email Partner
        if (!string.IsNullOrWhiteSpace(partnerKeyword))
        {
            var keyword = partnerKeyword.Trim();
            query = query.Where(p =>
                (p.Partner.FullName != null && p.Partner.FullName.Contains(keyword)) ||
                (p.Partner.Email != null && p.Partner.Email.Contains(keyword)) ||
                p.Booking.BookingCode.Contains(keyword));
        }

        // Lọc theo Status (Pending, Approved, Paid, Rejected)
        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusFilter = status.Trim();
            query = query.Where(p => p.Status == statusFilter);
        }

        // Lọc theo khoảng thời gian (CreatedAt)
        if (fromDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt <= toDate.Value);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        if (totalItems == 0)
        {
            return (Enumerable.Empty<PartnerPayouts>(), 0);
        }

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalItems);
    }

    public async Task<PartnerPayouts?> GetPayoutDetailsByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.PartnerPayouts
            .AsNoTracking()
            .Include(p => p.Partner)
            .Include(p => p.Booking)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<(decimal TotalNetPending, decimal TotalCommission, decimal TotalRevenue, int ActivePartners)> GetPayoutStatsAsync(
        CancellationToken cancellationToken = default)
    {
        var totalNetPending = await _context.PartnerPayouts
            .Where(p => p.Status == "Pending" || p.Status == "Approved")
            .SumAsync(p => (decimal?)p.NetAmount, cancellationToken) ?? 0m;

        var totalCommission = await _context.PartnerPayouts
            .SumAsync(p => (decimal?)p.CommissionAmount, cancellationToken) ?? 0m;

        var totalRevenue = await _context.PartnerPayouts
            .SumAsync(p => (decimal?)p.GrossAmount, cancellationToken) ?? 0m;

        var activePartners = await _context.PartnerPayouts
            .Select(p => p.PartnerId)
            .Distinct()
            .CountAsync(cancellationToken);

        return (totalNetPending, totalCommission, totalRevenue, activePartners);
    }
}
