using WanderVN.Domain.Entities;
using WanderVN.Domain.Enums;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Common.Utils;

public static class BookingPaymentExpirationHelper
{
    private const int DefaultExpirationMinutes = 30;
    private const string SettingKey = "UnpaidBookingExpirationMinutes";

    public static async Task<int> GetUnpaidBookingExpirationMinutesAsync(
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken)
    {
        var setting = await unitOfWork.SystemSettings.FindFirstOrDefaultAsync(
            s => s.Key == SettingKey,
            cancellationToken: cancellationToken);

        if (setting != null
            && int.TryParse(setting.Value, out var configuredMinutes)
            && configuredMinutes > 0)
        {
            return configuredMinutes;
        }

        return DefaultExpirationMinutes;
    }

    public static bool IsExpiredUnpaidHotelBooking(
        Bookings booking,
        int expirationMinutes,
        DateTimeOffset utcNow)
    {
        return booking.ServiceType == BookingServiceType.Hotel
            && booking.Status == BookingStatus.Pending
            && booking.PaymentStatus == BookingPaymentStatus.Unpaid
            && booking.CreatedAt != null
            && booking.CreatedAt <= utcNow.AddMinutes(-expirationMinutes);
    }
}
