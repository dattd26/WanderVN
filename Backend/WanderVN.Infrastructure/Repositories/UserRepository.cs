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
        string? fullName, // Biến này giờ sẽ đóng vai trò là "Từ khoá tìm kiếm chung" (Keyword)
        string? email,
        string? phoneNumber,
        string? roleName,
        bool? isActive,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .AsNoTracking()
            .AsQueryable();

        // 1. Lọc theo Role
        if (!string.IsNullOrWhiteSpace(roleName))
        {
            query = query.Where(u => u.Role != null && u.Role.Name == roleName);
        }

        // 2. Lọc theo Trạng thái (IsActive)
        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        // 3. TÌM KIẾM CHUNG (Gõ 1 ô tìm ra Tên OR Email OR SĐT)
        if (!string.IsNullOrWhiteSpace(fullName))
        {
            var keyword = fullName.Trim();
            query = query.Where(u => 
                (u.FullName != null && u.FullName.Contains(keyword)) ||
                (u.Email != null && u.Email.Contains(keyword)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(keyword))
            );
        }

        // 4. Tuỳ chọn: Giữ lại để dự phòng nếu các API khác muốn truyền riêng lẻ
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