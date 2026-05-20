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
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(fullName))
        {
            var fullNameFilter = fullName.Trim();
            query = query.Where(u => u.FullName != null && EF.Functions.Like(u.FullName, $"%{fullNameFilter}%"));
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            var emailFilter = email.Trim();
            query = query.Where(u => u.Email != null && EF.Functions.Like(u.Email, $"%{emailFilter}%"));
        }

        if (!string.IsNullOrWhiteSpace(phoneNumber))
        {
            var phoneFilter = phoneNumber.Trim();
            query = query.Where(u => u.PhoneNumber != null && EF.Functions.Like(u.PhoneNumber, $"%{phoneFilter}%"));
        }

        var totalItems = await query.CountAsync(cancellationToken);
        
        var users = await query
            .OrderBy(u => u.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (users, totalItems);
    }
}
