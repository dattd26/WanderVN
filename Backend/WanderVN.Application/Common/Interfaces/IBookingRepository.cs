using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Common.Interfaces;

public interface IBookingRepository : IGenericRepository<Bookings>
{
    Task<BookingLookupDetailDto?> LookupBookingAsync(string bookingCode, string email, CancellationToken cancellationToken = default);
    Task<List<BookingHistoryDto>> GetBookingHistoryAsync(int userId, CancellationToken cancellationToken = default);
}
