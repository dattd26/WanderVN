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
using WanderVN.Domain.Enums;

using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Bookings.Commands.CreateHotelBooking;

public class CreateHotelBookingCommandHandler : IRequestHandler<CreateHotelBookingCommand, HotelBookingResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;

    public CreateHotelBookingCommandHandler(IUnitOfWork unitOfWork, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
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
        var roomType = await _unitOfWork.RoomTypes
            .FindFirstOrDefaultAsync(rt => rt.Id == request.Request.RoomTypeId, includeProperties: "Hotel", cancellationToken: cancellationToken);

        if (roomType == null)
            throw new KeyNotFoundException("Không tìm thấy loại phòng yêu cầu");

        // Tìm phòng trống thuộc loại phòng được chọn trước khi tiến hành đặt hàng để tránh lỗi tạo đơn hàng khi hết phòng
        var room = await _unitOfWork.Rooms
            .FindFirstOrDefaultAsync(r => r.RoomTypeId == request.Request.RoomTypeId && r.Status == "Available", cancellationToken: cancellationToken);

        if (room == null)
        {
            throw new InvalidOperationException("Không còn phòng trống cho loại phòng đã chọn.");
        }

        // Tính toán tổng chi phí đặt phòng
        decimal totalPrice = request.Request.TotalPrice ?? roomType.BasePrice;

        // Xác thực: Guest bắt buộc phải có email
        if (request.Request.UserId == null && string.IsNullOrWhiteSpace(request.Request.Email))
        {
            throw new ArgumentException("Vui lòng cung cấp email liên hệ để đặt phòng.");
        }

        // Khởi tạo thông tin đơn đặt hàng
        var booking = new WanderVN.Domain.Entities.Bookings
        {
            UserId = request.Request.UserId,
            BookingCode = GenerateBookingCode(),
            ServiceType = BookingServiceType.Hotel,
            TotalPrice = totalPrice,
            Status = BookingStatus.Pending,
            PaymentStatus = BookingPaymentStatus.Unpaid,
            CreatedAt = DateTimeOffset.UtcNow,
            Email = request.Request.Email,
            CustomerName = request.Request.CustomerName,
            CustomerPhone = request.Request.CustomerPhone
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
        await _unitOfWork.Bookings.AddAsync(booking, cancellationToken);
        await _unitOfWork.Repository<WanderVN.Domain.Entities.BookingHotels>().AddAsync(bookingHotel, cancellationToken);

        // Thực hiện lưu toàn bộ thay đổi xuống DB trong một transaction duy nhất
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Xác định email và tên người nhận xác nhận (ưu tiên thông tin guest, fallback sang user đã đăng nhập)
        string? recipientEmail = request.Request.Email;
        string recipientName = request.Request.CustomerName ?? "Quý khách";

        if (string.IsNullOrEmpty(recipientEmail) && request.Request.UserId.HasValue)
        {
            var user = await _unitOfWork.Users.FindFirstOrDefaultAsync(u => u.Id == request.Request.UserId.Value, cancellationToken: cancellationToken);
            if (user != null)
            {
                recipientEmail = user.Email;
                recipientName = user.FullName ?? recipientName;
            }
        }

        if (!string.IsNullOrEmpty(recipientEmail))
        {
            var emailTo = recipientEmail;
            var nameForEmail = recipientName;
            var bookingCode = booking.BookingCode;
            var hotelName = roomType.Hotel?.Name ?? "Đối tác WanderVN";
            var roomTypeName = roomType.Name;
            var checkInStr = request.Request.CheckInDate;
            var checkOutStr = request.Request.CheckOutDate;

            _ = Task.Run(async () =>
            {
                try
                {
                    var emailSubject = $"[WanderVN] Xác nhận yêu cầu đặt phòng khách sạn #{bookingCode}";
                    var emailBody = $@"
                        <p>Kính gửi quý khách <strong>{nameForEmail}</strong>,</p>
                        <p>Cảm ơn bạn đã lựa chọn <strong>WanderVN</strong> làm bạn đồng hành. Yêu cầu đặt phòng khách sạn của bạn đã được tiếp nhận thành công và đang chờ thanh toán.</p>
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;'>Mã đặt phòng:</td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #735c00;'>{bookingCode}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Khách sạn:</td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee;'>{hotelName}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Loại phòng:</td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee;'>{roomTypeName}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Thời gian lưu trú:</td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee;'>Từ {checkInStr} đến {checkOutStr}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Tổng tiền:</td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #d32f2f;'>${totalPrice:N2} USD</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Trạng thái đơn:</td>
                                <td style='padding: 8px; border-bottom: 1px solid #eee;'><span style='background-color: #ffe0b2; color: #e65100; padding: 4px 8px; border-radius: 4px; font-weight: bold;'>Chờ thanh toán</span></td>
                            </tr>
                        </table>
                        <p>Vui lòng tiến hành thanh toán trong thời gian sớm nhất để hoàn tất việc đặt phòng của bạn.</p>";

                    await _emailService.SendEmailAsync(emailTo, emailSubject, emailBody, isHtml: true);
                }
                catch (Exception)
                {
                }
            });
        }

        return new HotelBookingResponse
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString()
        };
    }

    private string GenerateBookingCode()
    {
        return "BK" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
    }
}
