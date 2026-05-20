using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class UserRepository : GenericRepository<Users>, IUserRepository
{
    public UserRepository(WanderVNDbContext context) : base(context)
    {
    }

    public async Task<(IEnumerable<Users> Items, int TotalCount)> GetPagedUsersAsync(
        string? fullName,
        string? email,
        string? phoneNumber,
        string? roleName,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(roleName))
        {
            query = query.Where(u => u.Role != null && u.Role.Name == roleName);
        }

        if (!string.IsNullOrWhiteSpace(fullName))
        {
            var fullNameFilter = fullName.Trim();
            query = query.Where(u => u.FullName != null && u.FullName.Contains(fullNameFilter));
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            var emailFilter = email.Trim();
            query = query.Where(u => u.Email != null && u.Email.Contains(emailFilter));
        }

        if (!string.IsNullOrWhiteSpace(phoneNumber))
        {
            var phoneFilter = phoneNumber.Trim();
            query = query.Where(u => u.PhoneNumber != null && u.PhoneNumber.Contains(phoneFilter));
        }

        var totalItems = await query.CountAsync(cancellationToken);
        
        if (totalItems == 0)
        {
            return (Enumerable.Empty<Users>(), 0);
        }

        var users = await query
            .Include(u => u.Role)
            .OrderBy(u => u.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (users, totalItems);
    }

    public async Task<Users?> GetUserByIdAsync(
        int id,
        string? roleName = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Include(u => u.Hotels)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(roleName))
        {
            query = query.Where(u => u.Role != null && u.Role.Name == roleName);
        }

        return await query.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }
}
