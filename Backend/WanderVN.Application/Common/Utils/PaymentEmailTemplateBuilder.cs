using System;
using System.Linq;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Common.Utils;

public static class PaymentEmailTemplateBuilder
{
    public static (string Subject, string Body) BuildPaymentEmail(Bookings booking, string transactionNo)
    {
        var userFullName = booking.CustomerName ?? booking.User?.FullName ?? "Quý khách";
        var bookingCode = booking.BookingCode;
        var serviceType = booking.ServiceType;
        var totalPrice = booking.TotalPrice;
        var status = booking.Status;

        string detailsHtml = "";

        if (serviceType == "Flight" && booking.BookingFlights != null && booking.BookingFlights.Any())
        {
            var flightsList = booking.BookingFlights.ToList();
            var flightInfoHtml = "";

            // Group by flight if there are multiple passengers on the same flight
            var flightGroups = flightsList.GroupBy(f => f.Flight);

            foreach (var group in flightGroups)
            {
                var flight = group.Key;
                if (flight != null)
                {
                    var airline = flight.Airline?.Name ?? "Hãng hàng không";
                    var depAirport = flight.DepAirport?.Name ?? "N/A";
                    var depCity = flight.DepAirport?.City ?? "";
                    var arrAirport = flight.ArrAirport?.Name ?? "N/A";
                    var arrCity = flight.ArrAirport?.City ?? "";
                    
                    flightInfoHtml += $@"
                        <div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;'>
                            <h4 style='margin-top: 0; color: #735c00; border-bottom: 1px solid #ddd; padding-bottom: 5px;'>Thông tin chuyến bay {flight.FlightNumber} ({airline})</h4>
                            <p style='margin: 5px 0;'><strong>Khởi hành:</strong> {depAirport} {(!string.IsNullOrEmpty(depCity) ? $"({depCity})" : "")} - {flight.DepTime:dd/MM/yyyy HH:mm}</p>
                            <p style='margin: 5px 0;'><strong>Đến:</strong> {arrAirport} {(!string.IsNullOrEmpty(arrCity) ? $"({arrCity})" : "")} - {flight.ArrTime:dd/MM/yyyy HH:mm}</p>
                            
                            <table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>
                                <thead>
                                    <tr style='background-color: #eee;'>
                                        <th style='padding: 5px; text-align: left; border: 1px solid #ddd;'>Hành khách</th>
                                        <th style='padding: 5px; text-align: left; border: 1px solid #ddd;'>Hộ chiếu/CCCD</th>
                                        <th style='padding: 5px; text-align: left; border: 1px solid #ddd;'>Ghế ngồi</th>
                                    </tr>
                                </thead>
                                <tbody>";

                    foreach (var passenger in group)
                    {
                        flightInfoHtml += $@"
                                    <tr>
                                        <td style='padding: 5px; border: 1px solid #ddd;'>{passenger.PassengerName}</td>
                                        <td style='padding: 5px; border: 1px solid #ddd;'>{passenger.PassportNumber ?? "N/A"}</td>
                                        <td style='padding: 5px; border: 1px solid #ddd;'>{passenger.SeatNumber ?? "N/A"}</td>
                                    </tr>";
                    }

                    flightInfoHtml += @"
                                </tbody>
                            </table>
                        </div>";
                }
                else
                {
                    // Fallback if flight info is missing
                    foreach (var passenger in group)
                    {
                        flightInfoHtml += $"<p>• {passenger.PassengerName}</p>";
                    }
                }
            }

            detailsHtml = $@"
                <tr>
                    <td colspan='2' style='padding: 8px; border-bottom: 1px solid #eee;'>
                        {flightInfoHtml}
                    </td>
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

        string emailSubject = "";
        string emailBody = "";

        if (status == "Confirmed")
        {
            emailSubject = $"[WanderVN] Xác nhận thanh toán thành công #{bookingCode}";
            emailBody = $@"
                <p>Kính gửi quý khách <strong>{userFullName}</strong>,</p>
                <p>Chúng tôi xin trân trọng thông báo giao dịch thanh toán cho đơn hàng của quý khách tại <strong>WanderVN</strong> đã được hoàn tất thành công.</p>
                <p>Thông tin đặt chỗ của quý khách đã được xác nhận chính thức trên hệ thống:</p>
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
                        <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Mã giao dịch:</td>
                        <td style='padding: 8px; border-bottom: 1px solid #eee;'>{transactionNo}</td>
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

        return (emailSubject, emailBody);
    }
}
