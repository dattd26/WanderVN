using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Queries.GetBookingDetail;

public class GetBookingDetailQuery : IRequest<BookingHistoryDto?>
{
    public int BookingId { get; set; }
}
