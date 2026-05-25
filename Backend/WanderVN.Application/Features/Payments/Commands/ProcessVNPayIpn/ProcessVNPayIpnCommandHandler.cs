using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payments.Commands.ProcessVNPayIpn;

/// <summary>
/// Bộ xử lý Command tiếp nhận và xác thực kết quả thanh toán từ VNPay Server gửi về qua IPN.
/// </summary>
public class ProcessVNPayIpnCommandHandler : IRequestHandler<ProcessVNPayIpnCommand, VNPayIpnResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVNPayService _vnpayService;
    private readonly IEmailService _emailService;

    public ProcessVNPayIpnCommandHandler(IUnitOfWork unitOfWork, IVNPayService vnpayService, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _vnpayService = vnpayService;
        _emailService = emailService;
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
                includeProperties: "User,BookingHotels.Room.RoomType.Hotel,BookingFlights",
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
            if (booking.PaymentStatus == "Paid")
            {
                return new VNPayIpnResponse { Success = true, RspCode = "02", Message = "Order already confirmed" };
            }

            // 6. Xử lý trạng thái thanh toán dựa trên vnp_ResponseCode ("00" là thành công)
            if (responseCode == "00")
            {
                booking.PaymentStatus = "Paid";
                booking.Status = "Confirmed";

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
                booking.PaymentStatus = "Failed";
                booking.Status = "Cancelled";
            }

            // Đánh dấu cập nhật thực thể Booking
            _unitOfWork.Bookings.Update(booking);

            // Lưu thay đổi vào cơ sở dữ liệu qua Unit of Work
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Gửi email thông báo trạng thái thanh toán và đơn hàng bất đồng bộ
            if (booking.User != null && !string.IsNullOrEmpty(booking.User.Email))
            {
                var userEmail = booking.User.Email;
                var userFullName = booking.User.FullName ?? "Quý khách";
                var bookingCode = booking.BookingCode;
                var serviceType = booking.ServiceType;
                var totalPrice = booking.TotalPrice;
                var status = booking.Status;
                var paymentStatus = booking.PaymentStatus;
                var transNo = transactionNo?.ToString() ?? "N/A";

                // Chuẩn bị thông tin chi tiết dịch vụ để hiển thị trong email
                var detailsHtml = "";
                if (serviceType == "Flight" && booking.BookingFlights != null && booking.BookingFlights.Any())
                {
                    var flightListHtml = string.Join("<br/>", booking.BookingFlights.Select(f => $"• {f.PassengerName}"));
                    detailsHtml = $@"
                        <tr>
                            <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Danh sách hành khách:</td>
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>{flightListHtml}</td>
                        </tr>";
                }
                else if (serviceType == "Hotel" && booking.BookingHotels != null && booking.BookingHotels.Any())
                {
                    var bh = booking.BookingHotels.First();
                    var hotelName = bh.Room?.Hotel?.Name ?? "Đối tác WanderVN";
                    var roomTypeName = bh.Room?.RoomType?.Name ?? "Phòng tiêu chuẩn";
                    detailsHtml = $@"
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
                            <td style='padding: 8px; border-bottom: 1px solid #eee;'>Từ {bh.CheckInDate:dd/MM/yyyy} đến {bh.CheckOutDate:dd/MM/yyyy}</td>
                        </tr>";
                }

                _ = Task.Run(async () =>
                {
                    try
                    {
                        string emailSubject = "";
                        string emailBody = "";

                        if (status == "Confirmed")
                        {
                            emailSubject = $"[WanderVN] Xác nhận thanh toán thành công #{bookingCode}";
                            emailBody = $@"
                                <p>Kính gửi quý khách <strong>{userFullName}</strong>,</p>
                                <p>Chúng tôi xin trân trọng thông báo giao dịch thanh toán cho đơn hàng của quý khách tại <strong>WanderVN</strong> đã được hoàn tất thành công.</p>
                                <p>Thông tin đặt chỗ di sản của quý khách đã được xác nhận chính thức trên hệ thống:</p>
                                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;'>Mã đặt chỗ:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #735c00;'>{bookingCode}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Loại dịch vụ:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee;'>{serviceType} Booking</td>
                                    </tr>
                                    {detailsHtml}
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Tổng tiền đã trả:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #2e7d32;'>${totalPrice:N2} USD</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Mã giao dịch VNPay:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee;'>{transNo}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Trạng thái đặt chỗ:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee;'><span style='background-color: #c8e6c9; color: #256029; padding: 4px 8px; border-radius: 4px; font-weight: bold;'>Đã xác nhận (Thành công)</span></td>
                                    </tr>
                                </table>
                                <p>Hành trình di sản của bạn đã sẵn sàng. Chúc quý khách có những trải nghiệm tinh tế, bình yên và giàu cảm xúc.</p>";
                        }
                        else
                        {
                            emailSubject = $"[WanderVN] Thông báo hủy đơn đặt chỗ #{bookingCode}";
                            emailBody = $@"
                                <p>Kính gửi quý khách <strong>{userFullName}</strong>,</p>
                                <p>Chúng tôi rất tiếc phải thông báo rằng giao dịch thanh toán cho đơn hàng #{bookingCode} tại <strong>WanderVN</strong> không thành công hoặc đã bị hủy bỏ.</p>
                                <p>Chi tiết đơn hàng bị hủy như sau:</p>
                                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;'>Mã đơn hàng:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #735c00;'>{bookingCode}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Loại dịch vụ:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee;'>{serviceType} Booking</td>
                                    </tr>
                                    {detailsHtml}
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Tổng tiền:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #c62828;'>${totalPrice:N2} USD</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Trạng thái đơn:</td>
                                        <td style='padding: 8px; border-bottom: 1px solid #eee;'><span style='background-color: #ffcdd2; color: #c62828; padding: 4px 8px; border-radius: 4px; font-weight: bold;'>Đã hủy (Thanh toán thất bại)</span></td>
                                    </tr>
                                </table>
                                <p>Nếu có bất kỳ thắc mắc hoặc cần hỗ trợ kiểm tra lại giao dịch, quý khách vui lòng liên hệ với bộ phận hỗ trợ khách hàng của WanderVN.</p>";
                        }

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
}
