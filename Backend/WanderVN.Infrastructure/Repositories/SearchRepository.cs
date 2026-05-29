using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class SearchRepository : GenericRepository<Hotels>, ISearchRepository
{
    public SearchRepository(WanderVNDbContext context) : base(context)
    {
    }

    public async Task<List<Hotels>> SearchHotels(string location, DateTime checkInDate, DateTime checkOutDate, int guests, CancellationToken cancellationToken = default)
    {
        return await _context.Hotels
            .Include(h => h.Location)
            .Include(h => h.RoomTypes)
            .Include(h => h.HotelImages)
            .Where(h => h.IsActive == true &&
                        h.Status == 1 &&
                       (h.Location!.Name.ToLower().Contains(location.ToLower()) ||
                        (h.Address != null && h.Address.ToLower().Contains(location.ToLower()))) &&
                       h.RoomTypes.Any(rt => rt.Capacity >= guests))
            .OrderByDescending(h => h.StarRating)
            .Take(20)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Hotels>> SearchHotelsByLocation(string location, int guests = 1, int take = 10, CancellationToken cancellationToken = default)
    {
        var lowerLocation = location.ToLower();

        return await _context.Hotels
            .Include(h => h.Location)
            .Include(h => h.RoomTypes)
            .Include(h => h.HotelImages)
            .Where(h => h.IsActive == true &&
                        h.Status == 1 &&
                       (h.Location!.Name.ToLower().Contains(lowerLocation) ||
                        (h.Address != null && h.Address.ToLower().Contains(lowerLocation)) ||
                        (h.Location.Parent != null && h.Location.Parent.Name.ToLower().Contains(lowerLocation))) &&
                       h.RoomTypes.Any(rt => rt.Capacity >= guests))
            .OrderByDescending(h => h.StarRating)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<Hotels?> GetHotelWithDetails(int hotelId, CancellationToken cancellationToken = default)
    {
        return await _context.Hotels
            .Include(h => h.Location)
            .Include(h => h.RoomTypes)
            .Include(h => h.HotelImages)
            .Include(h => h.Amenity)
            .FirstOrDefaultAsync(h => h.Id == hotelId && h.IsActive == true, cancellationToken);
    }
}
