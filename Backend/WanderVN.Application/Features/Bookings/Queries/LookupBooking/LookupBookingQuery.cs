using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Queries.LookupBooking;

public class LookupBookingQuery : IRequest<BookingLookupDetailDto?>
{
    public string BookingCode { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
