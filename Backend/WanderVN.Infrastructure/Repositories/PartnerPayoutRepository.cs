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

        // Lọc theo Status
        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusTrimmed = status.Trim();
            if (Enum.TryParse<PayoutStatus>(statusTrimmed, true, out var statusEnum))
            {
                query = query.Where(p => p.Status == statusEnum);
            }
            else
            {
                // Ánh xạ trạng thái cũ (nếu có)
                if (statusTrimmed.Equals("Approved", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(p => p.Status == PayoutStatus.Processing);
                }
                else if (statusTrimmed.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(p => p.Status == PayoutStatus.Cancelled);
                }
            }
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
            .Where(p => p.Status == PayoutStatus.Pending || p.Status == PayoutStatus.Processing)
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

    public async Task<(IEnumerable<PartnerPayouts> Items, int TotalCount)> GetPartnerPagedPayoutsAsync(
        int partnerId,
        string? status,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.PartnerPayouts
            .AsNoTracking()
            .Include(p => p.Booking)
            .Where(p => p.PartnerId == partnerId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusTrimmed = status.Trim();
            if (Enum.TryParse<PayoutStatus>(statusTrimmed, true, out var statusEnum))
            {
                query = query.Where(p => p.Status == statusEnum);
            }
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

    public async Task<(decimal GrossTotal, decimal CommissionTotal, decimal NetTotal, decimal PendingBalance, decimal PaidThisMonth, decimal CommissionRate)> GetPartnerSummaryStatsAsync(
        int partnerId,
        CancellationToken cancellationToken = default)
    {
        // Read dynamic commission rate from SystemSettings
        decimal commissionRate = 0.10m; // Default 10%
        var feeSetting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == "CommissionFee", cancellationToken);
        if (feeSetting != null && decimal.TryParse(feeSetting.Value, out var rate))
        {
            commissionRate = rate / 100m;
        }

        var payouts = await _context.PartnerPayouts
            .Where(p => p.PartnerId == partnerId)
            .ToListAsync(cancellationToken);

        var grossTotal = payouts.Sum(p => p.GrossAmount);
        var commissionTotal = payouts.Sum(p => p.CommissionAmount);
        var netTotal = payouts.Sum(p => p.NetAmount);
        
        var pendingBalance = payouts
            .Where(p => p.Status == PayoutStatus.Pending || p.Status == PayoutStatus.Processing)
            .Sum(p => p.NetAmount);

        var currentMonth = DateTimeOffset.UtcNow.Month;
        var currentYear = DateTimeOffset.UtcNow.Year;
        
        var paidThisMonth = payouts
            .Where(p => p.Status == PayoutStatus.Paid && 
                        p.PaidAt.HasValue && 
                        p.PaidAt.Value.Month == currentMonth && 
                        p.PaidAt.Value.Year == currentYear)
            .Sum(p => p.NetAmount);

        return (grossTotal, commissionTotal, netTotal, pendingBalance, paidThisMonth, commissionRate);
    }

    public async Task<(IEnumerable<PayoutBatches> Items, int TotalCount)> GetPartnerPagedBatchesAsync(
        int partnerId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.PayoutBatches
            .AsNoTracking()
            .Include(b => b.Payouts)
                .ThenInclude(p => p.Booking)
            .Where(b => b.PartnerId == partnerId)
            .AsQueryable();

        var totalItems = await query.CountAsync(cancellationToken);
        if (totalItems == 0)
        {
            return (Enumerable.Empty<PayoutBatches>(), 0);
        }

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalItems);
    }
}
