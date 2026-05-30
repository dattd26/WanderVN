using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Features.Bookings.Commands.CreateFlightBooking;

public class CreateFlightBookingCommandHandler : IRequestHandler<CreateFlightBookingCommand, FlightBookingResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IDuffelService _duffelService;
    private readonly IEmailService _emailService;

    public CreateFlightBookingCommandHandler(IApplicationDbContext dbContext, IDuffelService duffelService, IEmailService emailService)
    {
        _dbContext = dbContext;
        _duffelService = duffelService;
        _emailService = emailService;
    }

    public async Task<FlightBookingResponse> Handle(CreateFlightBookingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // 1. Lấy chi tiết Offer gốc từ Duffel để trích xuất giá tiền thật (phục vụ thanh toán sandbox khớp 100%)
        string originalAmount = "1000.00";
        string originalCurrency = "USD";

        try
        {
            var offerJson = await _duffelService.GetOfferAsync(request.OfferId);
            using var offerDoc = JsonDocument.Parse(offerJson);
            var offerRoot = offerDoc.RootElement;

            if (offerRoot.TryGetProperty("data", out var dataProp) && dataProp.ValueKind == JsonValueKind.Object)
            {
                if (dataProp.TryGetProperty("total_amount", out var amountProp) && amountProp.ValueKind == JsonValueKind.String)
                {
                    originalAmount = amountProp.GetString() ?? originalAmount;
                }
                if (dataProp.TryGetProperty("total_currency", out var currencyProp) && currencyProp.ValueKind == JsonValueKind.String)
                {
                    originalCurrency = currencyProp.GetString() ?? originalCurrency;
                }
            }
        }
        catch (Exception ex)
        {
            // Dự phòng trong trường hợp không lấy được thông tin chi tiết Offer gốc
            Console.WriteLine($"⚠️ Lỗi khi lấy chi tiết Offer gốc từ Duffel: {ex.Message}");
        }

        // 2. Thiết lập đối tượng Yêu cầu Đặt vé gửi sang Duffel (Map to Duffel Request)
        var duffelRequest = new DuffelOrderRequestDto();
        duffelRequest.Data.Type = "instant";
        duffelRequest.Data.SelectedOffers.Add(request.OfferId);

        foreach (var pax in request.Passengers)
        {
            duffelRequest.Data.Passengers.Add(new DuffelPassengerDto
            {
                Id = pax.Id,
                Title = pax.Title,
                FamilyName = pax.FamilyName,
                GivenName = pax.GivenName,
                BornOn = pax.BornOn,
                Email = pax.Email,
                PhoneNumber = pax.PhoneNumber,
                Gender = pax.Gender
            });
        }

        // Thiết lập thông tin thanh toán cho vé máy bay (bắt buộc đối với loại đặt vé "instant")
        // Sử dụng giá trị gốc (originalAmount/originalCurrency) của Duffel để vượt qua kiểm tra Sandbox
        duffelRequest.Data.Payments = new List<DuffelPaymentDto>
        {
            new DuffelPaymentDto
            {
                Type = "balance",
                Amount = originalAmount,
                Currency = originalCurrency
            }
        };

        // 3. Gọi Duffel API để tạo đặt vé
        var duffelResponseJson = await _duffelService.CreateOrderAsync(duffelRequest);

        // 3. Parse Duffel Response to get Order ID
        var jsonDoc = JsonDocument.Parse(duffelResponseJson);
        var root = jsonDoc.RootElement;

        var duffelOrderId = root.GetProperty("data").GetProperty("id").GetString()
                            ?? GenerateLocalBookingCode();

        // 4. Quy đổi giá trị đặt vé từ USD sang VND và lưu vào cơ sở dữ liệu để thống nhất tiền tệ VND
        decimal totalPriceInVnd = Common.Utils.CurrencyConverter.ConvertUsdToVnd(request.TotalPrice);

        // Trích xuất thông tin liên hệ từ hành khách đầu tiên
        var primaryPax = request.Passengers.FirstOrDefault();
        var guestEmail = primaryPax?.Email;
        var guestName = primaryPax != null ? $"{primaryPax.GivenName} {primaryPax.FamilyName}".Trim() : null;
        var guestPhone = primaryPax?.PhoneNumber;

        if (request.UserId == null && string.IsNullOrWhiteSpace(guestEmail))
        {
            throw new ArgumentException("Vui lòng cung cấp email liên hệ để đặt vé máy bay.");
        }

        var booking = new WanderVN.Domain.Entities.Bookings
        {
            UserId = request.UserId,
            BookingCode = duffelOrderId,
            ServiceType = "Flight",
            TotalPrice = totalPriceInVnd,
            Status = "Pending",
            PaymentStatus = "Unpaid",
            CreatedAt = DateTimeOffset.UtcNow,
            Email = guestEmail,
            CustomerName = guestName,
            CustomerPhone = guestPhone
        };

        try
        {
            await _dbContext.Bookings.AddAsync(booking, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            // Save passengers to BookingFlights
            foreach (var pax in request.Passengers)
            {
                var bookingFlight = new WanderVN.Domain.Entities.BookingFlights
                {
                    BookingId = booking.Id,
                    PassengerName = $"{pax.Title} {pax.GivenName} {pax.FamilyName}",
                    PassportNumber = pax.PassportNumber,
                    // FlightId is left null as we rely on Duffel for flight data (Option A)
                    FlightId = null
                };

                await _dbContext.BookingFlights.AddAsync(bookingFlight, cancellationToken);
            }

            await _dbContext.SaveChangesAsync(cancellationToken);

            // Xác định email người nhận xác nhận (ưu tiên guest info, fallback sang user đã đăng nhập)
            string? recipientEmail = guestEmail;
            string recipientName = guestName ?? "Quý khách";

            if (string.IsNullOrEmpty(recipientEmail) && request.UserId.HasValue)
            {
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == request.UserId.Value, cancellationToken);
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
                var totalPrice = booking.TotalPrice;
                var passengerNames = request.Passengers.Select(p => $"{p.Title.ToUpper()} {p.GivenName} {p.FamilyName}").ToList();

                _ = Task.Run(async () =>
                {
                    try
                    {
                        var emailSubject = $"[WanderVN] Xác nhận yêu cầu đặt vé máy bay #{bookingCode}";
                        var passengerListHtml = string.Join("<br/>", passengerNames.Select(name => $"• {name}"));
                        var emailBody = $@"
                            <p>Kính gửi quý khách <strong>{nameForEmail}</strong>,</p>
                            <p>Cảm ơn bạn đã lựa chọn <strong>WanderVN</strong> làm bạn đồng hành. Yêu cầu đặt vé máy bay của bạn đã được tiếp nhận thành công và đang chờ thanh toán.</p>
                            <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                                <tr>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;'>Mã đặt vé:</td>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #735c00;'>{bookingCode}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Loại dịch vụ:</td>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee;'>Vé máy bay (Flight Booking)</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Danh sách hành khách:</td>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee;'>{passengerListHtml}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Tổng tiền:</td>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #d32f2f;'>${totalPrice:N2} VNĐ</td>
                                </tr>
                                <tr>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;'>Trạng thái đơn:</td>
                                    <td style='padding: 8px; border-bottom: 1px solid #eee;'><span style='background-color: #ffe0b2; color: #e65100; padding: 4px 8px; border-radius: 4px; font-weight: bold;'>Chờ thanh toán</span></td>
                                </tr>
                            </table>
                            <p>Vui lòng tiến hành thanh toán trong thời gian sớm nhất để hoàn tất việc xuất vé máy bay của bạn.</p>";

                        await _emailService.SendEmailAsync(emailTo, emailSubject, emailBody, isHtml: true);
                    }
                    catch (Exception)
                    {
                    }
                });
            }
        }
        catch (DbUpdateException ex)
        {
            // Bắt lỗi cập nhật DB và ném ra chi tiết lỗi bên trong (Inner Exception) để dễ dàng chẩn đoán lỗi
            throw new Exception($"Lỗi lưu cơ sở dữ liệu: {ex.Message}. Chi tiết lỗi SQL Server: {ex.InnerException?.Message}", ex);
        }

        return new FlightBookingResponse
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status ?? string.Empty
        };
    }

    private string GenerateLocalBookingCode()
    {
        return "FL" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
    }
}
