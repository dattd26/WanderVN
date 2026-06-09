using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.DTOs.Request;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Common.Interfaces;

public interface IFlightBookingDataPersister
{
    /// <summary>
    /// Phân tích phản hồi Duffel và lưu thông tin Hãng bay, Sân bay, Chuyến bay cùng Hành khách.
    /// </summary>
    Task PersistFlightDataAsync(
        WanderVN.Domain.Entities.Bookings booking,
        JsonDocument duffelResponse,
        List<PassengerDto> passengers,
        CancellationToken cancellationToken);
}
