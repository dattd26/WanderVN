using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Enums;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Partner.Commands.NoShowBooking;

public class NoShowBookingCommandHandler : IRequestHandler<NoShowBookingCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public NoShowBookingCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(NoShowBookingCommand request, CancellationToken cancellationToken)
    {
        var partnerId = _currentUserService.UserId;
        if (partnerId == null)
            throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        int currentPartnerId = partnerId.Value;

        // Truy vấn booking qua unit of work với đầy đủ navigation properties cần thiết
        var booking = await _unitOfWork.Bookings.FindFirstOrDefaultAsync(
            b => b.Id == request.BookingId 
                && b.ServiceType == BookingServiceType.Hotel 
                && b.BookingHotels.Any(bh => bh.Room != null 
                                          && bh.Room.RoomType != null 
                                          && bh.Room.RoomType.Hotel != null 
                                          && bh.Room.RoomType.HotelId == request.HotelId 
                                          && bh.Room.RoomType.Hotel.OwnerId == currentPartnerId),
            includeProperties: "BookingHotels,BookingHotels.Room,BookingHotels.Room.RoomType,BookingHotels.Room.RoomType.Hotel",
            disableTracking: false,
            cancellationToken: cancellationToken);

        if (booking == null)
            throw new ArgumentException("Không tìm thấy đơn đặt phòng, hoặc bạn không có quyền truy cập.");

        if (booking.Status != BookingStatus.Confirmed)
            throw new InvalidOperationException("Chỉ có thể đánh dấu Không đến cho đơn đặt phòng đã Xác nhận.");

        booking.Status = BookingStatus.NoShow;

        // Trả lại phòng nếu khách không đến
        if (booking.BookingHotels != null)
        {
            foreach (var bh in booking.BookingHotels)
            {
                if (bh.Room != null)
                {
                    bh.Room.Status = "Available";
                }
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}

