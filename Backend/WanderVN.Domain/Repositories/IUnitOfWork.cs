using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories;

/// <summary>
/// Giao diện Unit of Work để điều phối công việc của nhiều repository bằng cách chia sẻ cùng một transaction context của cơ sở dữ liệu.
/// </summary>
public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    /// <summary>
    /// Lấy một thực thể generic repository cho một kiểu entity cụ thể .
    /// </summary>
    IGenericRepository<T> Repository<T>() where T : class;

    // Các thuộc tính tường minh cho các thực thể cốt lõi trong domain du lịch
    IGenericRepository<Users> Users { get; }
    IGenericRepository<Hotels> Hotels { get; }
    IGenericRepository<Bookings> Bookings { get; }
    IGenericRepository<Rooms> Rooms { get; }
    IGenericRepository<RoomTypes> RoomTypes { get; }
    IGenericRepository<Flights> Flights { get; }
    IGenericRepository<Payments> Payments { get; }

    /// <summary>
    /// Lưu tất cả các thay đổi đang chờ trong unit of work này vào cơ sở dữ liệu .
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Khởi đầu một transaction cơ sở dữ liệu .
    /// </summary>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Xác nhận (commit) transaction hiện tại .
    /// </summary> 
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Hoàn tác (rollback) transaction hiện tại .
    /// </summary>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
