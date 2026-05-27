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
}
