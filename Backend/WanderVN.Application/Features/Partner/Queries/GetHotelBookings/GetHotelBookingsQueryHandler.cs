using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Queries.GetHotelBookings;

// Handler thực hiện gọi truy vấn danh sách đặt phòng từ IPartnerRepository
public class GetHotelBookingsQueryHandler : IRequestHandler<GetHotelBookingsQuery, List<HotelBookingDto>>
{
    private readonly IPartnerRepository _partnerRepository;

    public GetHotelBookingsQueryHandler(IPartnerRepository partnerRepository)
    {
        _partnerRepository = partnerRepository;
    }

    public async Task<List<HotelBookingDto>> Handle(GetHotelBookingsQuery request, CancellationToken cancellationToken)
    {
        var bookings = await _partnerRepository.GetHotelBookingsAsync(request.HotelId, cancellationToken);

        return bookings.Select(b => new HotelBookingDto
        {
            BookingId = b.BookingId,
            Id = b.Id,
            GuestName = b.GuestName,
            Email = b.Email,
            RoomTypeName = b.RoomTypeName,
            CheckIn = b.CheckIn,
            CheckOut = b.CheckOut,
            TotalPrice = b.TotalPrice,
            Status = b.Status,
            SpecialRequests = b.SpecialRequests
        }).ToList();
    }
}
