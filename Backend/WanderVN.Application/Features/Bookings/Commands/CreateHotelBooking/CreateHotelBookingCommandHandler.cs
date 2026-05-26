using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Features.Bookings.Commands.CreateHotelBooking;

public class CreateHotelBookingCommandHandler : IRequestHandler<CreateHotelBookingCommand, HotelBookingResponse>
{
    private readonly IApplicationDbContext _dbContext;

    public CreateHotelBookingCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HotelBookingResponse> Handle(CreateHotelBookingCommand request, CancellationToken cancellationToken)
    {
        // Kiểm tra định dạng ngày check-in và check-out
        if (!DateTime.TryParseExact(request.Request.CheckInDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var checkIn) ||
            !DateTime.TryParseExact(request.Request.CheckOutDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var checkOut))
        {
            throw new ArgumentException("Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd");
        }

        if (checkIn >= checkOut)
            throw new ArgumentException("Ngày nhận phòng phải trước ngày trả phòng");

        // Tìm loại phòng trong cơ sở dữ liệu
        var roomType = await _dbContext.RoomTypes
            .Where(rt => rt.Id == request.Request.RoomTypeId)
            .Select(rt => new WanderVN.Domain.Entities.RoomTypes { Id = rt.Id, BasePrice = rt.BasePrice })
            .FirstOrDefaultAsync(cancellationToken);

        if (roomType == null)
            throw new KeyNotFoundException("Không tìm thấy loại phòng yêu cầu");

        // Tìm phòng trống thuộc loại phòng được chọn trước khi tiến hành đặt hàng để tránh lỗi tạo đơn hàng khi hết phòng
        var room = await _dbContext.Rooms
            .Where(r => r.RoomTypeId == request.Request.RoomTypeId && r.Status == "Available")
            .FirstOrDefaultAsync(cancellationToken);

        if (room == null)
        {
            throw new InvalidOperationException("Không còn phòng trống cho loại phòng đã chọn.");
        }

        // Tính toán tổng chi phí đặt phòng
        decimal totalPrice = request.Request.TotalPrice ?? roomType.BasePrice;

        // Khởi tạo thông tin đơn đặt hàng
        var booking = new WanderVN.Domain.Entities.Bookings
        {
            UserId = request.Request.UserId,
            BookingCode = GenerateBookingCode(),
            ServiceType = "Hotel",
            TotalPrice = totalPrice,
            Status = "Pending",
            PaymentStatus = "Unpaid",
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Khởi tạo chi tiết đặt phòng khách sạn và liên kết với đơn hàng thông qua navigation property
        var bookingHotel = new WanderVN.Domain.Entities.BookingHotels
        {
            Booking = booking,
            RoomId = room.Id,
            CheckInDate = DateOnly.FromDateTime(checkIn),
            CheckOutDate = DateOnly.FromDateTime(checkOut)
        };

        // Cập nhật trạng thái phòng sang Đã đặt
        room.Status = "Booked";

        // Thêm đơn hàng và chi tiết đặt phòng vào context
        await _dbContext.Bookings.AddAsync(booking, cancellationToken);
        await _dbContext.BookingHotels.AddAsync(bookingHotel, cancellationToken);

        // Thực hiện lưu toàn bộ thay đổi xuống DB trong một transaction duy nhất
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new HotelBookingResponse
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status ?? string.Empty
        };
    }

    private string GenerateBookingCode()
    {
        return "BK" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
    }
}
