using MediatR;
using System.Collections.Generic;

namespace WanderVN.Application.Features.Partner.Queries.GetHotelBookings;

public class GetHotelBookingsQuery : IRequest<List<HotelBookingDto>>
{
    public int HotelId { get; set; }
}

public class HotelBookingDto
{
    public string Id { get; set; } = string.Empty;
    public string GuestName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public string CheckIn { get; set; } = string.Empty;
    public string CheckOut { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = "Confirmed";
    public string? SpecialRequests { get; set; }
}
