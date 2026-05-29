using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories;

public interface IHotelsRepository : IGenericRepository<Hotels>
{
    Task<Hotels?> GetHotelByIdWithDetails(int id, CancellationToken cancellationToken = default);

    // ── Admin Hotel Review ──
    Task<(IReadOnlyList<Hotels> Items, int Total)> ListForReviewAsync(
        int? status, int pageNumber, int pageSize, CancellationToken cancellationToken = default);

    Task<Hotels?> GetForReviewAsync(int hotelId, CancellationToken cancellationToken = default);

    Task<(int Pending, int Approved, int Rejected)> GetReviewCountsAsync(CancellationToken cancellationToken = default);

    Task<bool> ApproveAsync(int hotelId, CancellationToken cancellationToken = default);

    Task<bool> RejectAsync(int hotelId, string reason, CancellationToken cancellationToken = default);
}
