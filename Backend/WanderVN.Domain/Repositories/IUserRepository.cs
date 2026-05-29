using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories
{
    public interface IUserRepository : IGenericRepository<Users>
    {
        Task<(IEnumerable<Users> Items, int TotalCount)> GetPagedUsersAsync(
            string? fullName,
            string? email,
            string? phoneNumber,
            string? roleName,
            bool? isActive,
            int? status,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<Users?> GetUserByIdAsync(
            int id,
            string? roleName = null,
            CancellationToken cancellationToken = default);
    }
}