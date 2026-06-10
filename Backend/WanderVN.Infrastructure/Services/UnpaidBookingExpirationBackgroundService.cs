using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Enums;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Services;

/// <summary>
/// Background service tu dong huy booking khach san chua thanh toan qua thoi han giu phong.
/// </summary>
public class UnpaidBookingExpirationBackgroundService : BackgroundService
{
    private const int DefaultExpirationMinutes = 30;
    private static readonly TimeSpan ScanInterval = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<UnpaidBookingExpirationBackgroundService> _logger;

    public UnpaidBookingExpirationBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<UnpaidBookingExpirationBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("UnpaidBookingExpirationBackgroundService bat dau hoat dong.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ExpireUnpaidBookingsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi khi tu dong huy booking chua thanh toan qua han.");
            }

            await Task.Delay(ScanInterval, stoppingToken);
        }

        _logger.LogInformation("UnpaidBookingExpirationBackgroundService dang dung hoat dong.");
    }

    private async Task ExpireUnpaidBookingsAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<WanderVNDbContext>();

        var expirationMinutes = await GetExpirationMinutesAsync(context, stoppingToken);
        var thresholdTime = DateTimeOffset.UtcNow.AddMinutes(-expirationMinutes);

        var expiredBookingIds = await context.Bookings
            .Where(b => b.ServiceType == BookingServiceType.Hotel
                     && b.Status == BookingStatus.Pending
                     && b.PaymentStatus == BookingPaymentStatus.Unpaid
                     && b.CreatedAt != null
                     && b.CreatedAt <= thresholdTime)
            .Select(b => b.Id)
            .ToListAsync(stoppingToken);

        if (expiredBookingIds.Count == 0)
        {
            return;
        }

        _logger.LogInformation("Tim thay {Count} booking chua thanh toan qua han giu phong.", expiredBookingIds.Count);

        foreach (var bookingId in expiredBookingIds)
        {
            using var transaction = await context.Database.BeginTransactionAsync(stoppingToken);

            try
            {
                var booking = await context.Bookings
                    .Include(b => b.BookingHotels)
                        .ThenInclude(bh => bh.Room)
                    .FirstOrDefaultAsync(b => b.Id == bookingId, stoppingToken);

                if (booking == null
                    || booking.ServiceType != BookingServiceType.Hotel
                    || booking.Status != BookingStatus.Pending
                    || booking.PaymentStatus != BookingPaymentStatus.Unpaid
                    || booking.CreatedAt == null
                    || booking.CreatedAt > thresholdTime)
                {
                    await transaction.RollbackAsync(stoppingToken);
                    continue;
                }

                booking.Status = BookingStatus.Cancelled;

                foreach (var bookingHotel in booking.BookingHotels)
                {
                    if (bookingHotel.Room != null)
                    {
                        bookingHotel.Room.Status = "Available";
                    }
                }

                await context.SaveChangesAsync(stoppingToken);
                await transaction.CommitAsync(stoppingToken);

                _logger.LogInformation("Da huy booking {BookingId} do qua han thanh toan va tra phong ve Available.", booking.Id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(stoppingToken);
                _logger.LogError(ex, "Loi khi huy booking chua thanh toan qua han {BookingId}.", bookingId);
            }
        }
    }

    private static async Task<int> GetExpirationMinutesAsync(WanderVNDbContext context, CancellationToken cancellationToken)
    {
        var setting = await context.Set<SystemSettings>()
            .FirstOrDefaultAsync(s => s.Key == "UnpaidBookingExpirationMinutes", cancellationToken);

        if (setting != null
            && int.TryParse(setting.Value, out var configuredMinutes)
            && configuredMinutes > 0)
        {
            return configuredMinutes;
        }

        return DefaultExpirationMinutes;
    }
}
