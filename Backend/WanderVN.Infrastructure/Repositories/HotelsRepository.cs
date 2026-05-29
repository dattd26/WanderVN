using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class HotelsRepository : GenericRepository<Hotels>, IHotelsRepository
{
    public HotelsRepository(WanderVNDbContext context) : base(context)
    {
    }

    public async Task<Hotels?> GetHotelByIdWithDetails(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Hotels
            .Include(h => h.Location)
            .Include(h => h.RoomTypes)
            .Include(h => h.HotelImages)
            .Include(h => h.Amenity)
            .FirstOrDefaultAsync(h => h.Id == id && h.IsActive == true, cancellationToken);
    }

    public async Task<(IReadOnlyList<Hotels> Items, int Total)> ListForReviewAsync(
        int? status, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Hotels
            .AsNoTracking()
            .Include(h => h.Owner)
            .Include(h => h.Location)
            .Include(h => h.PropertyType)
            .Include(h => h.HotelImages)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(h => h.Status == status.Value);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(h => h.SubmittedAt ?? h.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<Hotels?> GetForReviewAsync(int hotelId, CancellationToken cancellationToken = default)
    {
        return await _context.Hotels
            .AsNoTracking()
            .Include(h => h.Owner)
            .Include(h => h.Location)
            .Include(h => h.PropertyType)
            .Include(h => h.HotelImages)
            .Include(h => h.RoomTypes)
            .FirstOrDefaultAsync(h => h.Id == hotelId, cancellationToken);
    }

    public async Task<(int Pending, int Approved, int Rejected)> GetReviewCountsAsync(CancellationToken cancellationToken = default)
    {
        var grouped = await _context.Hotels
            .AsNoTracking()
            .GroupBy(h => h.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        int Get(int s) => grouped.FirstOrDefault(x => x.Status == s)?.Count ?? 0;
        return (Get(0), Get(1), Get(2));
    }

    public async Task<bool> ApproveAsync(int hotelId, CancellationToken cancellationToken = default)
    {
        var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId, cancellationToken);
        if (hotel is null) return false;

        hotel.Status = 1;
        hotel.ApprovedAt = DateTimeOffset.UtcNow;
        hotel.RejectReason = null;
        hotel.IsActive = true;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> RejectAsync(int hotelId, string reason, CancellationToken cancellationToken = default)
    {
        var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId, cancellationToken);
        if (hotel is null) return false;

        hotel.Status = 2;
        hotel.RejectReason = reason;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
