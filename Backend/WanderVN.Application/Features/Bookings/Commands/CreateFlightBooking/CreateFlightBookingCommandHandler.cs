using System;
using System.Globalization;
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
using WanderVN.Domain.Enums;

using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Bookings.Commands.CreateFlightBooking;

public class CreateFlightBookingCommandHandler : IRequestHandler<CreateFlightBookingCommand, FlightBookingResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDuffelService _duffelService;
    private readonly IEmailService _emailService;
    private readonly IFlightBookingDataPersister _flightBookingDataPersister;
    private readonly IFlightSearchCacheService _flightSearchCacheService;

    public CreateFlightBookingCommandHandler(IUnitOfWork unitOfWork, IDuffelService duffelService, IEmailService emailService, IFlightBookingDataPersister flightBookingDataPersister, IFlightSearchCacheService flightSearchCacheService)
    {
        _unitOfWork = unitOfWork;
        _duffelService = duffelService;
        _emailService = emailService;
        _flightBookingDataPersister = flightBookingDataPersister;
        _flightSearchCacheService = flightSearchCacheService;
    }

    public async Task<FlightBookingResponse> Handle(CreateFlightBookingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Lấy thông tin user đăng nhập sớm để làm fallback nếu thiếu thông tin liên hệ
        WanderVN.Domain.Entities.Users? user = null;
        if (request.UserId.HasValue)
        {
            user = await _unitOfWork.Users.FindFirstOrDefaultAsync(u => u.Id == request.UserId.Value, cancellationToken: cancellationToken);
        }

        // Trích xuất thông tin liên hệ từ hành khách đầu tiên
        var primaryPax = request.Passengers.FirstOrDefault();
        var guestEmail = primaryPax?.Email;
        var guestName = primaryPax != null ? $"{primaryPax.GivenName} {primaryPax.FamilyName}".Trim() : null;
        var guestPhone = primaryPax?.PhoneNumber;

        if (string.IsNullOrWhiteSpace(guestEmail) && user != null)
        {
            guestEmail = user.Email;
        }
        if (string.IsNullOrWhiteSpace(guestPhone) && user != null)
        {
            guestPhone = user.PhoneNumber;
        }

        if (string.IsNullOrWhiteSpace(guestEmail))
        {
            throw new ArgumentException("Vui lòng cung cấp email liên hệ để đặt vé máy bay.");
        }

        if (string.IsNullOrWhiteSpace(guestPhone))
        {
            throw new ArgumentException("Vui lòng cung cấp số điện thoại liên hệ để đặt vé máy bay.");
        }

        guestPhone = NormalizePhoneNumber(guestPhone);
        Console.WriteLine("Guest Email: " + guestEmail);
        Console.WriteLine("Guest Phone: " + guestPhone);
        // 1. Lấy chi tiết Offer gốc từ Duffel để trích xuất giá tiền thật (phục vụ thanh toán sandbox khớp 100%)
        string originalAmount = "1000.00";
        string originalCurrency = "USD";
        var passengerTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

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

                if (dataProp.TryGetProperty("passengers", out var passengersProp) && passengersProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var p in passengersProp.EnumerateArray())
                    {
                        var pId = p.TryGetProperty("id", out var idVal) ? idVal.GetString() : null;
                        var pType = p.TryGetProperty("type", out var typeVal) ? typeVal.GetString() : null;
                        if (!string.IsNullOrEmpty(pId) && !string.IsNullOrEmpty(pType))
                        {
                            passengerTypes[pId] = pType;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Lỗi khi lấy chi tiết Offer gốc từ Duffel: {ex.Message}");
            throw new ArgumentException("Offer không tồn tại hoặc đã hết hạn.");
        }

        var duffelRequest = new DuffelOrderRequestDto();
        duffelRequest.Data.Type = "hold";
        duffelRequest.Data.SelectedOffers.Add(request.OfferId);

        var infantPassengerIds = new List<string>();
        foreach (var pax in request.Passengers)
        {
            if (passengerTypes.TryGetValue(pax.Id, out var type) && type.Equals("infant_without_seat", StringComparison.OrdinalIgnoreCase))
            {
                infantPassengerIds.Add(pax.Id);
            }
        }

        var duffelPassengersList = new List<DuffelPassengerDto>();
        var adultPassengers = new List<DuffelPassengerDto>();

        for (int i = 0; i < request.Passengers.Count; i++)
        {
            var pax = request.Passengers[i];
            var pEmail = pax.Email;
            var pPhone = pax.PhoneNumber;

            if (string.IsNullOrWhiteSpace(pEmail)) pEmail = guestEmail;
            if (string.IsNullOrWhiteSpace(pPhone)) pPhone = guestPhone;
            pPhone = NormalizePhoneNumber(pPhone);

            var duffelPax = new DuffelPassengerDto
            {
                Id = pax.Id,
                Title = pax.Title,
                FamilyName = pax.FamilyName,
                GivenName = pax.GivenName,
                BornOn = pax.BornOn,
                Email = pEmail,
                PhoneNumber = pPhone,
                Gender = pax.Gender
            };

            duffelPassengersList.Add(duffelPax);

            if (passengerTypes.TryGetValue(pax.Id, out var type) && type.Equals("adult", StringComparison.OrdinalIgnoreCase))
            {
                adultPassengers.Add(duffelPax);
            }
        }

        // Link infant passengers to their accompanying adult passengers
        for (int idx = 0; idx < infantPassengerIds.Count; idx++)
        {
            if (idx < adultPassengers.Count)
            {
                adultPassengers[idx].InfantPassengerId = infantPassengerIds[idx];
            }
        }

        duffelRequest.Data.Passengers.AddRange(duffelPassengersList);

        // Vô hiệu hóa cache kết quả tìm kiếm chuyến bay để tránh lỗi offer_request_already_booked
        // khi những người dùng khác cố gắng đặt chung một OfferRequest (do Duffel quy định mỗi Request chỉ được đặt 1 lần).
        await _flightSearchCacheService.InvalidateByOfferIdAsync(request.OfferId, cancellationToken);

        string duffelResponseJson;
        try
        {
            duffelResponseJson = await _duffelService.CreateOrderAsync(duffelRequest);
        }
        catch (HttpRequestException ex) when (ex.Message.Contains("offer_request_already_booked"))
        {
            throw new ArgumentException("Chuyến bay này đã được đặt hoặc không còn khả dụng, vui lòng tìm kiếm lại.", ex);
        }

        // Parse Duffel Response to get Order ID
        var jsonDoc = JsonDocument.Parse(duffelResponseJson);
        var root = jsonDoc.RootElement;

        var duffelOrderId = root.GetProperty("data").GetProperty("id").GetString()
                            ?? GenerateLocalBookingCode();

        // 4. Tính toán giá vé chi tiết (server-side, không tin vào TotalPrice từ client)
        decimal duffelAmountUsd = decimal.TryParse(originalAmount, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedUsd)
            ? parsedUsd : 0m;
        decimal duffelAmountVnd = Common.Utils.CurrencyConverter.ConvertUsdToVnd(duffelAmountUsd);

        // Đọc tỷ lệ markup từ SystemSettings (key: "FlightMarkupPercent", mặc định 5%)
        decimal markupPercent = 5m;
        var markupSetting = await _unitOfWork.SystemSettings
            .FindFirstOrDefaultAsync(s => s.Key == "FlightMarkupPercent", cancellationToken: cancellationToken);
        if (markupSetting != null && decimal.TryParse(markupSetting.Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var mp))
            markupPercent = mp;

        // Đọc phí cổng thanh toán từ SystemSettings theo phương thức (key: "VNPayFeeVnd" / "ZaloPayFeeVnd", mặc định 10.000đ)
        decimal paymentFeeVnd = 10000m;
        var feeKey = request.PaymentMethod?.Trim().ToLowerInvariant() switch
        {
            "zalopay" => "ZaloPayFeeVnd",
            _ => "VNPayFeeVnd"
        };
        var feeSetting = await _unitOfWork.SystemSettings
            .FindFirstOrDefaultAsync(s => s.Key == feeKey, cancellationToken: cancellationToken);
        if (feeSetting != null && decimal.TryParse(feeSetting.Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var fee))
            paymentFeeVnd = fee;

        decimal markupAmountVnd = Math.Round(duffelAmountVnd * markupPercent / 100m);
        decimal customerTotalVnd = duffelAmountVnd + markupAmountVnd + paymentFeeVnd;

        var booking = new WanderVN.Domain.Entities.Bookings
        {
            UserId = request.UserId,
            BookingCode = duffelOrderId,
            ServiceType = BookingServiceType.Flight,
            TotalPrice = customerTotalVnd,
            DuffelAmountVnd = duffelAmountVnd,
            MarkupAmountVnd = markupAmountVnd,
            PaymentFeeVnd = paymentFeeVnd,
            Status = BookingStatus.Pending,
            PaymentStatus = BookingPaymentStatus.Unpaid,
            CreatedAt = DateTimeOffset.UtcNow,
            Email = guestEmail,
            CustomerName = guestName,
            CustomerPhone = guestPhone
        };

        try
        {
            await _unitOfWork.Bookings.AddAsync(booking, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Lưu thông tin chuyến bay, hãng hàng không, sân bay và hành khách (Hybrid Storage Pattern)
            try
            {
                await _flightBookingDataPersister.PersistFlightDataAsync(booking, jsonDoc, request.Passengers, cancellationToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Lỗi khi phân tích và lưu chặng bay: {ex.Message}. Sử dụng phương thức dự phòng.");

                // Phương án dự phòng: Nếu phân tích chặng bay thất bại, lưu thông tin tối thiểu
                foreach (var pax in request.Passengers)
                {
                    var bookingFlight = new WanderVN.Domain.Entities.BookingFlights
                    {
                        BookingId = booking.Id,
                        PassengerName = $"{pax.Title} {pax.GivenName} {pax.FamilyName}",
                        PassportNumber = pax.PassportNumber,
                        FlightId = null
                    };

                    await _unitOfWork.Repository<WanderVN.Domain.Entities.BookingFlights>().AddAsync(bookingFlight, cancellationToken);
                }
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            // Xác định email người nhận xác nhận (ưu tiên guest info, fallback sang user đã đăng nhập)
            string? recipientEmail = guestEmail;
            string recipientName = guestName ?? "Quý khách";

            if (string.IsNullOrEmpty(recipientEmail) && user != null)
            {
                recipientEmail = user.Email;
                recipientName = user.FullName ?? recipientName;
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
            Status = booking.Status.ToString(),
            DuffelAmountVnd = duffelAmountVnd,
            MarkupAmountVnd = markupAmountVnd,
            PaymentFeeVnd = paymentFeeVnd,
            TotalPrice = customerTotalVnd
        };
    }

    private string GenerateLocalBookingCode()
    {
        return "FL" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
    }

    private string NormalizePhoneNumber(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            throw new ArgumentException("Số điện thoại không được để trống.");

        var trimmed = phone.Trim();
        var hasPlus = trimmed.StartsWith("+");
        var digits = new string(trimmed.Where(char.IsDigit).ToArray());

        if (string.IsNullOrEmpty(digits))
            throw new ArgumentException("Số điện thoại không hợp lệ.");

        if (hasPlus)
            return "+" + digits;

        if (digits.StartsWith("84") && digits.Length >= 11)
            return "+" + digits;

        if (digits.StartsWith("0") && digits.Length >= 10 && digits.Length <= 11)
            return "+84" + digits.Substring(1);

        throw new ArgumentException("Số điện thoại không hợp lệ. Vui lòng bao gồm mã quốc gia (VD: +84...).");
    }
}
