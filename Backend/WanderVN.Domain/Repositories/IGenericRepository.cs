using System.Linq.Expressions;

namespace WanderVN.Domain.Repositories;

/// <summary>
/// Giao diện generic repository định nghĩa các thao tác CRUD.
/// </summary>
/// <typeparam name="T">Kiểu của entity, phải là một tham chiếu (reference type).</typeparam>
public interface IGenericRepository<T> where T : class
{
    /// <summary>
    /// Lấy một entity theo khóa chính của.
    /// </summary>
    Task<T?> GetByIdAsync(object id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy tất cả các entity.
    /// </summary>
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Tìm kiếm các entity dựa trên biểu thức điều kiện (predicate).
    /// </summary>
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Tìm entity đầu tiên khớp với điều kiện, tùy chọn nạp các thuộc tính liên kết (navigation properties) và bật/tắt theo dõi (tracking).
    /// </summary>
    Task<T?> FindFirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate,
        string? includeProperties = null,
        bool disableTracking = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Truy vấn các entity với các tùy chọn linh hoạt (lọc, sắp xếp, nạp các thuộc tính liên kết, hành vi theo dõi).
    /// </summary>
    Task<IEnumerable<T>> GetAsync(
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        string? includeProperties = null,
        bool disableTracking = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm một entity vào database context
    /// </summary>
    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm danh sách entity vào database context
    /// </summary>
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);

    /// <summary>
    /// Đánh dấu một entity là đã cập nhật trong database context.
    /// </summary>
    void Update(T entity);

    /// <summary>
    /// Xóa một entity khỏi database context.
    /// </summary>
    void Remove(T entity);

    /// <summary>
    /// Xóa danh sách entity khỏi database context.
    /// </summary>
    void RemoveRange(IEnumerable<T> entities);
}
