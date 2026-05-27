using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories;

public interface IRoleRepository
{
    Task<IEnumerable<Roles>> GetAllAsync(CancellationToken cancellationToken = default);
}
