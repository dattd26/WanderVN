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
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default);
    }
}
