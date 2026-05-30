using MediatR;
using WanderVN.Application.DTOs.Response;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Bookings.Queries.LookupBooking;

public class LookupBookingQueryHandler : IRequestHandler<LookupBookingQuery, BookingLookupDetailDto?>
{
    private readonly IBookingRepository _bookingRepository;

    public LookupBookingQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<BookingLookupDetailDto?> Handle(LookupBookingQuery request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        return await _bookingRepository.LookupBookingAsync(request.BookingCode, normalizedEmail, cancellationToken);
    }
}
