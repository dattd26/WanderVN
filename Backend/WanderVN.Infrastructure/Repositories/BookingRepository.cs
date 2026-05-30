using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class BookingRepository : GenericRepository<Bookings>, IBookingRepository
{
    private readonly WanderVNDbContext _dbContext;

    public BookingRepository(WanderVNDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BookingLookupDetailDto?> LookupBookingAsync(string bookingCode, string email, CancellationToken cancellationToken = default)
    {
        var result = await _dbContext.Database.SqlQuery<BookingLookupDetailDto>(
            $"EXEC sp_LookupBooking @BookingCode = {bookingCode}, @Email = {email}")
            .FirstOrDefaultAsync(cancellationToken);

        return result;
    }
}
