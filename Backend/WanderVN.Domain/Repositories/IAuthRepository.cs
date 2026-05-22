using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories // Hoặc WanderVN.Domain.Repositories tuỳ cấu trúc của bạn
{
    public interface IAuthRepository : IGenericRepository<Users>
    {
        // Các hàm đặc thù cho luồng Auth mà Generic chưa có sẵn
        Task<Users?> GetUserByEmailAsync(string email);
        
        Task<bool> IsEmailUniqueAsync(string email);
        
        // Vẫn giữ lại hàm này vì nó thao tác với bảng Roles (khác với bảng Users)
        Task<Roles?> GetRoleByNameAsync(string roleName); 
    }
}