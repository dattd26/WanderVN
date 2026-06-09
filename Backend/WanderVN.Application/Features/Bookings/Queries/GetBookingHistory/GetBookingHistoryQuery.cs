using System.Collections.Generic;
using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Queries.GetBookingHistory;

public class GetBookingHistoryQuery : IRequest<List<BookingHistoryDto>>
{
}
