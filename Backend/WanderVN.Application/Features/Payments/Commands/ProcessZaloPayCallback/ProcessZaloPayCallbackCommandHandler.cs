using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Utils;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Domain.Enums;

namespace WanderVN.Application.Features.Payments.Commands.ProcessZaloPayCallback;

/// <summary>
/// Bộ xử lý Command tiếp nhận và xác thực kết quả thanh toán từ ZaloPay qua Callback Webhook.
/// </summary>
public class ProcessZaloPayCallbackCommandHandler : IRequestHandler<ProcessZaloPayCallbackCommand, ZaloPayCallbackResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IZaloPayService _zalopayService;
    private readonly IEmailService _emailService;
    private readonly IDuffelService _duffelService;

    public ProcessZaloPayCallbackCommandHandler(IUnitOfWork unitOfWork, IZaloPayService zalopayService, IEmailService emailService, IDuffelService duffelService)
    {
        _unitOfWork = unitOfWork;
        _zalopayService = zalopayService;
        _emailService = emailService;
        _duffelService = duffelService;
    }

    /// <summary>
    /// Xử lý xác thực chữ ký callback và cập nhật trạng thái hóa đơn.
    /// </summary>
    public async Task<ZaloPayCallbackResponse> Handle(ProcessZaloPayCallbackCommand command, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Xác thực chữ ký mac đảm bảo thông tin không bị thay đổi và được gửi đúng từ ZaloPay
            if (!_zalopayService.ValidateSignature(command.Data, command.Mac))
            {
                return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = "Chữ ký bảo mật ZaloPay không hợp lệ (mac invalid)" };
            }

            // 2. Phân tích chuỗi JSON "data" từ ZaloPay
            using var jsonDocument = JsonDocument.Parse(command.Data);
            var root = jsonDocument.RootElement;

            if (!root.TryGetProperty("app_trans_id", out var appTransIdProp) || string.IsNullOrEmpty(appTransIdProp.GetString()))
            {
                return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = "Thiếu thông tin mã giao dịch app_trans_id" };
            }

            string appTransId = appTransIdProp.GetString()!;

            // 3. Tách BookingId ra khỏi chuỗi app_trans_id (dạng yyMMdd_bookingId_HHmmss)
            var idParts = appTransId.Split('_');
            if (idParts.Length < 2 || !int.TryParse(idParts[1], out int bookingId))
            {
                return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = "Mã giao dịch ZaloPay không đúng định dạng WanderVN" };
            }

            if (!root.TryGetProperty("amount", out var amountProp))
            {
                return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = "Thiếu số tiền giao dịch amount" };
            }

            long amountPaid = amountProp.GetInt64();
            string zpTransId = root.TryGetProperty("zp_trans_id", out var zpIdProp) ? zpIdProp.ToString() : string.Empty;

            // 4. Tìm kiếm đơn đặt hàng trong cơ sở dữ liệu qua Unit Of Work
            var booking = await _unitOfWork.Bookings.FindFirstOrDefaultAsync(
                b => b.Id == bookingId,
                includeProperties: "User,BookingHotels.Room.RoomType.Hotel,BookingFlights.Flight.Airline,BookingFlights.Flight.DepAirport,BookingFlights.Flight.ArrAirport",
                cancellationToken: cancellationToken);

            if (booking == null)
            {
                return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = $"Không tìm thấy đơn đặt hàng #{bookingId}" };
            }

            // 5. Kiểm tra chênh lệch số tiền
            // Số tiền trong booking.TotalPrice hiện tại luôn luôn được lưu bằng VND thống nhất trong cơ sở dữ liệu.
            if ((long)booking.TotalPrice != amountPaid)
            {
                return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = "Số tiền thanh toán từ ZaloPay không trùng khớp với hóa đơn" };
            }

            // 6. Kiểm tra xem đơn hàng đã được xác nhận thanh toán chưa (tránh xử lý trùng lặp - Double Confirm)
            if (booking.PaymentStatus == BookingPaymentStatus.Paid)
            {
                return new ZaloPayCallbackResponse { ReturnCode = 1, ReturnMessage = "Đơn hàng đã được ghi nhận thanh toán trước đó (double confirm)" };
            }

            var expirationMinutes = await BookingPaymentExpirationHelper.GetUnpaidBookingExpirationMinutesAsync(_unitOfWork, cancellationToken);
            if (BookingPaymentExpirationHelper.IsExpiredUnpaidHotelBooking(booking, expirationMinutes, DateTimeOffset.UtcNow))
            {
                return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = "Đơn hàng đã quá hạn thanh toán" };
            }

            if (booking.Status != BookingStatus.Pending || booking.PaymentStatus != BookingPaymentStatus.Unpaid)
            {
                return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = "Đơn hàng không còn ở trạng thái chờ thanh toán" };
            }

            // 7. Cập nhật trạng thái thanh toán thành công
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
                }
            }

            booking.PaymentStatus = BookingPaymentStatus.Paid;
            booking.Status = BookingStatus.Confirmed;

            // 8. Lưu lịch sử giao dịch vào bảng Payments (sử dụng đơn vị VND để thống nhất dòng tiền thực tế)
            var payment = new WanderVN.Domain.Entities.Payments
            {
                BookingId = booking.Id,
                Amount = (decimal)amountPaid,
                Method = "ZALOPAY",
                TransactionId = zpTransId,
                PaymentDate = DateTimeOffset.UtcNow
            };

            await _unitOfWork.Payments.AddAsync(payment, cancellationToken);
            _unitOfWork.Bookings.Update(booking);

            // 9. Cam kết lưu các thay đổi vào cơ sở dữ liệu
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 10. Gửi email thông báo trạng thái thanh toán và đơn hàng bất đồng bộ
            if (!string.IsNullOrEmpty(booking.Email) || (booking.User != null && !string.IsNullOrEmpty(booking.User.Email)))
            {
                var userEmail = booking.Email ?? booking.User!.Email;
                var transNo = zpTransId ?? "N/A";

                _ = Task.Run(async () =>
                {
                    try
                    {
                        var (emailSubject, emailBody) = PaymentEmailTemplateBuilder.BuildPaymentEmail(booking, transNo);
                        await _emailService.SendEmailAsync(userEmail, emailSubject, emailBody, isHtml: true);
                    }
                    catch (Exception ex)
                    {
                        // Bỏ qua lỗi gửi mail để tránh làm gián đoạn luồng chính
                        Console.WriteLine($"⚠️ Lỗi khi gửi email: {ex.Message}");
                    }
                });
            }

            return new ZaloPayCallbackResponse { ReturnCode = 1, ReturnMessage = "success" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Lỗi khi xử lý Callback ZaloPay: {ex.Message}");
            return new ZaloPayCallbackResponse { ReturnCode = 2, ReturnMessage = $"Lỗi xử lý hệ thống: {ex.Message}" };
        }
    }
}
