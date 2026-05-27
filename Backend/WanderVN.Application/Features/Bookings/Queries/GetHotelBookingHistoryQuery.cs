using System.Collections.Generic;
using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Queries.GetHotelBookingHistory;

public class GetHotelBookingHistoryQuery : IRequest<List<HotelBookingHistoryDto>>
{
    public int UserId { get; set; }
}