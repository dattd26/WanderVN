using Microsoft.EntityFrameworkCore.Storage;
using System.Collections.Concurrent;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

/// <summary>
/// Lớp triển khai thực tế của mẫu thiết kế Unit of Work sử dụng Entity Framework Core.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly WanderVNDbContext _context;
    private IDbContextTransaction? _transaction;
    private readonly ConcurrentDictionary<string, object> _repositories;
    private bool _disposed;

    // Explicitly cached repositories for core business domain entities
    public IGenericRepository<Users> Users => Repository<Users>();
    public IGenericRepository<Hotels> Hotels => Repository<Hotels>();
    public IGenericRepository<Bookings> Bookings => Repository<Bookings>();
    public IGenericRepository<Rooms> Rooms => Repository<Rooms>();
    public IGenericRepository<RoomTypes> RoomTypes => Repository<RoomTypes>();
    public IGenericRepository<Flights> Flights => Repository<Flights>();
    public IGenericRepository<Payments> Payments => Repository<Payments>();
    public IGenericRepository<PartnerPayouts> PartnerPayouts => Repository<PartnerPayouts>();
    public IGenericRepository<PayoutBatches> PayoutBatches => Repository<PayoutBatches>();
    public IGenericRepository<SystemSettings> SystemSettings => Repository<SystemSettings>();

    public UnitOfWork(WanderVNDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _repositories = new ConcurrentDictionary<string, object>();
    }

    /// <inheritdoc />
    public IGenericRepository<T> Repository<T>() where T : class
    {
        var typeName = typeof(T).Name;
        return (IGenericRepository<T>)_repositories.GetOrAdd(typeName, _ => new GenericRepository<T>(_context));
    }

    /// <inheritdoc />
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            return;
        }
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await SaveChangesAsync(cancellationToken);
            if (_transaction != null)
            {
                await _transaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    /// <inheritdoc />
    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync(cancellationToken);
            }
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    /// <inheritdoc />
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _transaction?.Dispose();
                _context.Dispose();
            }
            _disposed = true;
        }
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();
        Dispose(false);
        GC.SuppressFinalize(this);
    }

    protected virtual async ValueTask DisposeAsyncCore()
    {
        if (!_disposed)
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
            }
            await _context.DisposeAsync();
            _disposed = true;
        }
    }
}
