using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly WanderVNDbContext _context;

    public RoleRepository(WanderVNDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Roles>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .AsNoTracking()
            .OrderBy(r => r.Id)
            .ToListAsync(cancellationToken);
    }
}
