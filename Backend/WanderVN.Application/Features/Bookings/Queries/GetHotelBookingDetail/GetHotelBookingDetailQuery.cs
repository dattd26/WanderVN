using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Queries.GetHotelBookingDetail;

public class GetHotelBookingDetailQuery : IRequest<HotelBookingHistoryDto?>
{
    public int BookingId { get; set; }
}
