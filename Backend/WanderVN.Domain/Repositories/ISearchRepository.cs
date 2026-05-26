using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories;

public interface ISearchRepository : IGenericRepository<Hotels>
{
    Task<List<Hotels>> SearchHotels(string location, DateTime checkInDate, DateTime checkOutDate, int guests, CancellationToken cancellationToken = default);
    Task<Hotels?> GetHotelWithDetails(int hotelId, CancellationToken cancellationToken = default);
}
