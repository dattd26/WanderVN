using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class SearchRepository : GenericRepository<Hotels>, ISearchRepository
{
    private readonly WanderVNDbContext _dbContext;

    public SearchRepository(WanderVNDbContext context) : base(context)
    {
    }

    public async Task<List<Hotels>> SearchHotels(string location, DateTime checkInDate, DateTime checkOutDate, int guests, CancellationToken cancellationToken = default)
    {
        var hotels = await _dbContext.Hotels
            .Include(h => h.Location)
            .Include(h => h.RoomTypes)
            .Include(h => h.HotelImages)
            .Where(h => h.IsActive == true &&
                       h.Location!.Name.ToLower().Contains(location.ToLower()) &&
                       h.RoomTypes.Any(rt => rt.Capacity >= guests))
            .OrderByDescending(h => h.StarRating)
            .Take(20)
            .ToListAsync(cancellationToken);

        return hotels;
    }

    public async Task<Hotels?> GetHotelWithDetails(int hotelId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Hotels
            .Include(h => h.Location)
            .Include(h => h.RoomTypes)
            .Include(h => h.HotelImages)
            .Include(h => h.Amenity)
            .FirstOrDefaultAsync(h => h.Id == hotelId && h.IsActive == true, cancellationToken);
    }
}
