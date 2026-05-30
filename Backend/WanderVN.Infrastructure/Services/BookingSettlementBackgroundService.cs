using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Domain.Entities;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Services;

/// <summary>
/// Background Service tự động quyét các Booking trạng thái Completed sau khi hết thời gian bảo lưu (Grace Period) để tạo Payout Pending cho đối tác.
/// </summary>
public class BookingSettlementBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BookingSettlementBackgroundService> _logger;

    public BookingSettlementBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<BookingSettlementBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BookingSettlementBackgroundService bắt đầu hoạt động.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingSettlementsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xảy ra khi thực hiện đối soát tự động.");
            }

            // Chạy định kỳ mỗi 5 phút
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }

        _logger.LogInformation("BookingSettlementBackgroundService đang dừng hoạt động.");
    }

    private async Task ProcessPendingSettlementsAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<WanderVNDbContext>();

        // 1. Đọc cấu hình thời gian bảo lưu (Grace Period) và tỷ lệ hoa hồng (Commission Fee) từ SystemSettings
        var gracePeriodSetting = await context.Set<SystemSettings>()
            .FirstOrDefaultAsync(s => s.Key == "PayoutGracePeriodHours", stoppingToken);
        int gracePeriodHours = 24; // mặc định 24 giờ nếu chưa cấu hình
        if (gracePeriodSetting != null && int.TryParse(gracePeriodSetting.Value, out var parsedGrace))
        {
            gracePeriodHours = parsedGrace;
        }

        var commissionSetting = await context.Set<SystemSettings>()
            .FirstOrDefaultAsync(s => s.Key == "CommissionFee", stoppingToken);
        decimal commissionRate = 0.15m; // mặc định 15%
        if (commissionSetting != null && decimal.TryParse(commissionSetting.Value, out var parsedRate))
        {
            commissionRate = parsedRate / 100m;
        }

        var thresholdTime = DateTimeOffset.UtcNow.AddHours(-gracePeriodHours);

        // 2. Tìm các Booking hợp lệ để đối soát:
        // - Là đặt phòng khách sạn (ServiceType == "Hotel")
        // - Trạng thái đã hoàn thành (Status == "Completed")
        // - Đã thanh toán (PaymentStatus == "Paid")
        // - Đã lưu vết thời gian checkout (CheckedOutAt != null) và vượt quá khoảng thời gian bảo lưu (CheckedOutAt <= thresholdTime)
        // - Chưa tạo PartnerPayouts
        var eligibleBookings = await context.Bookings
            .Include(b => b.BookingHotels)
                .ThenInclude(bh => bh.Room!)
                    .ThenInclude(r => r.Hotel)
            .Where(b => b.ServiceType == "Hotel"
                     && b.Status == "Completed"
                     && b.PaymentStatus == "Paid"
                     && b.CheckedOutAt != null
                     && b.CheckedOutAt <= thresholdTime
                     && !context.PartnerPayouts.Any(p => p.BookingId == b.Id))
            .ToListAsync(stoppingToken);

        if (!eligibleBookings.Any())
        {
            return;
        }

        _logger.LogInformation("Tìm thấy {Count} Booking hợp lệ đủ điều kiện đối soát.", eligibleBookings.Count);

        foreach (var booking in eligibleBookings)
        {
            var hotel = booking.BookingHotels.FirstOrDefault()?.Room?.Hotel;
            if (hotel == null || hotel.OwnerId == null)
            {
                _logger.LogWarning("Booking {BookingId} đủ điều kiện nhưng không tìm thấy thông tin Khách sạn hoặc OwnerId.", booking.Id);
                continue;
            }

            var partnerId = hotel.OwnerId.Value;

            using var transaction = await context.Database.BeginTransactionAsync(stoppingToken);
            try
            {
                // Tạo PartnerPayouts
                var grossAmount = booking.TotalPrice;
                var commissionAmount = grossAmount * commissionRate;
                var netAmount = grossAmount - commissionAmount;

                var payout = new PartnerPayouts
                {
                    PartnerId = partnerId,
                    BookingId = booking.Id,
                    GrossAmount = grossAmount,
                    CommissionAmount = commissionAmount,
                    NetAmount = netAmount,
                    Status = PayoutStatus.Pending,
                    PayoutMethod = "Manual",
                    CreatedAt = DateTimeOffset.UtcNow
                };

                context.PartnerPayouts.Add(payout);

                // Cập nhật trạng thái Booking sang SettlementPending
                booking.Status = "SettlementPending";
                context.Bookings.Update(booking);

                await context.SaveChangesAsync(stoppingToken);
                await transaction.CommitAsync(stoppingToken);

                _logger.LogInformation("Tạo Payout Chờ thanh toán thành công cho Booking {BookingId}, Partner {PartnerId}.", booking.Id, partnerId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(stoppingToken);
                _logger.LogError(ex, "Lỗi khi xử lý đối soát tự động cho Booking {BookingId}.", booking.Id);
            }
        }
    }
}
