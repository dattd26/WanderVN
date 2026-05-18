using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data; // Đường dẫn chứa WanderVNDbContext

namespace WanderVN.Infrastructure.Repositories;

// Kế thừa GenericRepository<Users> để có sẵn các hàm CRUD
// Implement IAuthRepository để có các hàm đặc thù
public class AuthRepository : GenericRepository<Users>, IAuthRepository
{
    // Tiêm DbContext và truyền (base) nó cho lớp cha GenericRepository xử lý
    public AuthRepository(WanderVNDbContext context) : base(context)
    {
    }

    public async Task<Users?> GetUserByEmailAsync(string email)
    {
        // Nhờ kế thừa, ta gọi trực tiếp hàm FindFirstOrDefaultAsync của lớp cha
        return await FindFirstOrDefaultAsync(
            predicate: u => u.Email == email,
            includeProperties: "Role"
        );
    }

    public async Task<bool> IsEmailUniqueAsync(string email)
    {
        // Tương tự, gọi hàm của lớp cha
        var existingUser = await FindFirstOrDefaultAsync(
            predicate: u => u.Email == email,
            disableTracking: true
        );
        
        return existingUser == null;
    }

    // HÀM AddUserAsync ĐÃ BỊ XÓA! 
    // Vì lớp cha (GenericRepository) đã cung cấp sẵn hàm AddAsync(Users entity) rồi.

    public async Task<Roles?> GetRoleByNameAsync(string roleName)
    {
        // Vì lớp cha chỉ quản lý DbSet<Users>, nên để truy vấn bảng Roles, 
        // ta gọi thẳng _context (biến protected đã được định nghĩa ở lớp cha GenericRepository)
        return await _context.Set<Roles>()
            .AsNoTracking() // Tương đương disableTracking: true để tối ưu tốc độ
            .FirstOrDefaultAsync(r => r.Name == roleName);
    }
}