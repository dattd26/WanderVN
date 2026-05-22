using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories;

public interface IHotelsRepository : IGenericRepository<Hotels>
{
    Task<Hotels?> GetHotelByIdWithDetails(int id, CancellationToken cancellationToken = default);
}
