using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Utils;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Domain.Enums;

namespace WanderVN.Application.Features.Payments.Commands.ProcessVNPayIpn;

/// <summary>
/// Bộ xử lý Command tiếp nhận và xác thực kết quả thanh toán từ VNPay Server gửi về qua IPN.
/// </summary>
public class ProcessVNPayIpnCommandHandler : IRequestHandler<ProcessVNPayIpnCommand, VNPayIpnResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVNPayService _vnpayService;
    private readonly IEmailService _emailService;
    private readonly IDuffelService _duffelService;

    public ProcessVNPayIpnCommandHandler(IUnitOfWork unitOfWork, IVNPayService vnpayService, IEmailService emailService, IDuffelService duffelService)
    {
        _unitOfWork = unitOfWork;
        _vnpayService = vnpayService;
        _emailService = emailService;
        _duffelService = duffelService;
    }

    /// <summary>
    /// Xử lý cập nhật hóa đơn dựa trên thông tin IPN của VNPay.
    /// </summary>
    public async Task<VNPayIpnResponse> Handle(ProcessVNPayIpnCommand command, CancellationToken cancellationToken)
    {
        // 1. Xác thực chữ ký checksum đảm bảo gói tin không bị thay đổi và đến đúng từ VNPay
        if (!_vnpayService.ValidateSignature(command.Parameters))
        {
            return new VNPayIpnResponse { RspCode = "97", Message = "Invalid Checksum" };
        }

        // 2. Trích xuất các tham số cần thiết
        if (!command.Parameters.TryGetValue("vnp_TxnRef", out var txnRef) || string.IsNullOrEmpty(txnRef))
        {
            return new VNPayIpnResponse { RspCode = "99", Message = "Missing vnp_TxnRef" };
        }

        // Tách BookingId ra từ chuỗi vnp_TxnRef (được định dạng "BookingId_Ticks")
        var txnParts = txnRef.Split('_');
        if (!int.TryParse(txnParts[0], out int bookingId))
        {
            return new VNPayIpnResponse { RspCode = "01", Message = "Order not found (Invalid TxnRef format)" };
        }

        if (!command.Parameters.TryGetValue("vnp_Amount", out var amountStr) || !long.TryParse(amountStr, out long vnpAmount))
        {
            return new VNPayIpnResponse { RspCode = "99", Message = "Missing or invalid vnp_Amount" };
        }
        // VNPay nhân số tiền lên 100 lần, ta cần chia ngược lại để có số tiền thực tế (VND)
        decimal amountPaid = (decimal)vnpAmount / 100;

        command.Parameters.TryGetValue("vnp_ResponseCode", out var responseCode);
        command.Parameters.TryGetValue("vnp_TransactionNo", out var transactionNo);

        try
        {
            // 3. Tìm kiếm đơn đặt hàng trong Database thông qua repository
            var booking = await _unitOfWork.Bookings.FindFirstOrDefaultAsync(
                b => b.Id == bookingId,
                includeProperties: "User,BookingHotels.Room.RoomType.Hotel,BookingFlights.Flight.Airline,BookingFlights.Flight.DepAirport,BookingFlights.Flight.ArrAirport",
                cancellationToken: cancellationToken);

            if (booking == null)
            {
                return new VNPayIpnResponse { Success = false, RspCode = "01", Message = "Order not found" };
            }

            // 4. Kiểm tra số tiền thanh toán từ VNPay có trùng khớp với giá trị của hóa đơn hay không
            // Số tiền trong booking.TotalPrice hiện tại luôn luôn được lưu bằng VND thống nhất trong cơ sở dữ liệu.
            if (booking.TotalPrice != amountPaid)
            {
                return new VNPayIpnResponse { Success = false, RspCode = "04", Message = "Invalid Amount" };
            }

            // 5. Kiểm tra xem hóa đơn này đã được xác nhận thanh toán trước đó chưa (tránh Double Confirm)
            if (booking.PaymentStatus == BookingPaymentStatus.Paid)
            {
                return new VNPayIpnResponse { Success = true, RspCode = "02", Message = "Order already confirmed" };
            }

            var expirationMinutes = await BookingPaymentExpirationHelper.GetUnpaidBookingExpirationMinutesAsync(_unitOfWork, cancellationToken);
            if (BookingPaymentExpirationHelper.IsExpiredUnpaidHotelBooking(booking, expirationMinutes, DateTimeOffset.UtcNow))
            {
                return new VNPayIpnResponse { Success = false, RspCode = "02", Message = "Order payment window expired" };
            }

            if (booking.Status != BookingStatus.Pending || booking.PaymentStatus != BookingPaymentStatus.Unpaid)
            {
                return new VNPayIpnResponse { Success = false, RspCode = "02", Message = "Order is no longer pending payment" };
            }

            // 6. Xử lý trạng thái thanh toán dựa trên vnp_ResponseCode ("00" là thành công)
            if (responseCode == "00")
            {
                if (booking.ServiceType == BookingServiceType.Flight && !string.IsNullOrEmpty(booking.BookingCode))
                {
                    try
                    {
                        decimal duffelAmountUsd = WanderVN.Application.Common.Utils.CurrencyConverter.ConvertVndToUsd(booking.DuffelAmountVnd.GetValueOrDefault(0m));
                        await _duffelService.PayOrderAsync(booking.BookingCode, duffelAmountUsd.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture), "USD");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"⚠️ Lỗi khi thanh toán Duffel Order: {ex.Message}");
                        // Lưu ý: Nếu Duffel lỗi, thanh toán nội bộ vẫn được ghi nhận để đối soát (refund thủ công).
                    }
                }

                booking.PaymentStatus = BookingPaymentStatus.Paid;
                booking.Status = BookingStatus.Confirmed;

                // Lưu thông tin giao dịch vào bảng Payments làm lịch sử giao dịch (sử dụng đơn vị VND thống nhất)
                var payment = new WanderVN.Domain.Entities.Payments
                {
                    BookingId = booking.Id,
                    Amount = amountPaid,
                    Method = "VNPAY",
                    TransactionId = transactionNo,
                    PaymentDate = DateTimeOffset.UtcNow
                };

                await _unitOfWork.Payments.AddAsync(payment, cancellationToken);
            }
            else
            {
                // Giao dịch không thành công ở cổng VNPay
                booking.PaymentStatus = BookingPaymentStatus.Failed;
                booking.Status = BookingStatus.Cancelled;
                ReleaseHotelRooms(booking);
            }

            // Đánh dấu cập nhật thực thể Booking
            _unitOfWork.Bookings.Update(booking);

            // Lưu thay đổi vào cơ sở dữ liệu qua Unit of Work
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Gửi email thông báo trạng thái thanh toán và đơn hàng bất đồng bộ
            if (!string.IsNullOrEmpty(booking.Email) || (booking.User != null && !string.IsNullOrEmpty(booking.User.Email)))
            {
                var userEmail = booking.Email ?? booking.User!.Email;
                var transNo = transactionNo?.ToString() ?? "N/A";

                _ = Task.Run(async () =>
                {
                    try
                    {
                        var (emailSubject, emailBody) = WanderVN.Application.Common.Utils.PaymentEmailTemplateBuilder.BuildPaymentEmail(booking, transNo);

                        await _emailService.SendEmailAsync(userEmail, emailSubject, emailBody, isHtml: true);
                    }
                    catch (Exception)
                    {
                        // Bỏ qua lỗi gửi mail để tránh làm gián đoạn luồng chính
                    }
                });
            }

            return new VNPayIpnResponse { Success = true, RspCode = "00", Message = "Confirm Success" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Lỗi khi xử lý IPN VNPay: {ex.Message}");
            return new VNPayIpnResponse { Success = false, RspCode = "99", Message = "Internal Server Error" };
        }
    }

    private static void ReleaseHotelRooms(WanderVN.Domain.Entities.Bookings booking)
    {
        if (booking.ServiceType != BookingServiceType.Hotel)
        {
            return;
        }

        foreach (var bookingHotel in booking.BookingHotels)
        {
            if (bookingHotel.Room != null)
            {
                bookingHotel.Room.Status = "Available";
            }
        }
    }
}
