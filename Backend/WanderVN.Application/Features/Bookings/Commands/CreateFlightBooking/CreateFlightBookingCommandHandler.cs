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

    public CreateFlightBookingCommandHandler(IUnitOfWork unitOfWork, IDuffelService duffelService, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
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
            bool parsedSlicesAndSegments = false;
            try
            {
                if (root.TryGetProperty("data", out var dataProp) && 
                    dataProp.TryGetProperty("slices", out var slicesProp) && 
                    slicesProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var slice in slicesProp.EnumerateArray())
                    {
                        if (slice.TryGetProperty("segments", out var segmentsProp) && 
                            segmentsProp.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var segment in segmentsProp.EnumerateArray())
                            {
                                string segmentId = segment.TryGetProperty("id", out var segIdVal) ? (segIdVal.GetString() ?? "") : "";

                                // Lấy thông tin Hãng hàng không (Operating hoặc Marketing)
                                if (!segment.TryGetProperty("operating_carrier", out var carrier) || carrier.ValueKind != JsonValueKind.Object)
                                {
                                    segment.TryGetProperty("marketing_carrier", out carrier);
                                }

                                Airlines? airline = null;
                                if (carrier.ValueKind == JsonValueKind.Object)
                                {
                                    var airlineName = carrier.TryGetProperty("name", out var nameVal) ? nameVal.GetString() : "Hãng hàng không";
                                    var logoUrl = carrier.TryGetProperty("logo_symbol_url", out var logoSymbolVal) 
                                        ? logoSymbolVal.GetString() 
                                        : (carrier.TryGetProperty("logo_lockup_url", out var logoLockupVal) ? logoLockupVal.GetString() : null);

                                    airline = await _unitOfWork.Repository<Airlines>().FindFirstOrDefaultAsync(a => a.Name == airlineName, cancellationToken: cancellationToken);
                                    if (airline == null)
                                    {
                                        airline = new Airlines
                                        {
                                            Name = airlineName ?? "Hãng hàng không",
                                            LogoUrl = logoUrl
                                        };
                                        await _unitOfWork.Repository<Airlines>().AddAsync(airline, cancellationToken);
                                        await _unitOfWork.SaveChangesAsync(cancellationToken);
                                    }
                                }

                                // Lấy thông tin Sân bay đi (Origin Airport)
                                Airports? depAirport = null;
                                if (segment.TryGetProperty("origin", out var originObj) && originObj.ValueKind == JsonValueKind.Object)
                                {
                                    var originIata = originObj.TryGetProperty("iata_code", out var iataVal) ? iataVal.GetString() : null;
                                    if (!string.IsNullOrEmpty(originIata))
                                    {
                                        var originName = originObj.TryGetProperty("name", out var nameVal) ? nameVal.GetString() : null;
                                        string? originCity = null;
                                        if (originObj.TryGetProperty("city_name", out var cityVal))
                                        {
                                            originCity = cityVal.GetString();
                                        }
                                        else if (originObj.TryGetProperty("city", out var cityObjVal) && cityObjVal.ValueKind == JsonValueKind.Object)
                                        {
                                            if (cityObjVal.TryGetProperty("name", out var cityNameVal))
                                            {
                                                originCity = cityNameVal.GetString();
                                            }
                                        }

                                        depAirport = await _unitOfWork.Repository<Airports>().FindFirstOrDefaultAsync(a => a.IataCode == originIata, cancellationToken: cancellationToken);
                                        if (depAirport == null)
                                        {
                                            depAirport = new Airports
                                            {
                                                IataCode = originIata,
                                                Name = originName,
                                                City = originCity
                                            };
                                            await _unitOfWork.Repository<Airports>().AddAsync(depAirport, cancellationToken);
                                            await _unitOfWork.SaveChangesAsync(cancellationToken);
                                        }
                                    }
                                }

                                // Lấy thông tin Sân bay đến (Destination Airport)
                                Airports? arrAirport = null;
                                if (segment.TryGetProperty("destination", out var destObj) && destObj.ValueKind == JsonValueKind.Object)
                                {
                                    var destIata = destObj.TryGetProperty("iata_code", out var iataVal) ? iataVal.GetString() : null;
                                    if (!string.IsNullOrEmpty(destIata))
                                    {
                                        var destName = destObj.TryGetProperty("name", out var nameVal) ? nameVal.GetString() : null;
                                        string? destCity = null;
                                        if (destObj.TryGetProperty("city_name", out var cityVal))
                                        {
                                            destCity = cityVal.GetString();
                                        }
                                        else if (destObj.TryGetProperty("city", out var cityObjVal) && cityObjVal.ValueKind == JsonValueKind.Object)
                                        {
                                            if (cityObjVal.TryGetProperty("name", out var cityNameVal))
                                            {
                                                destCity = cityNameVal.GetString();
                                            }
                                        }

                                        arrAirport = await _unitOfWork.Repository<Airports>().FindFirstOrDefaultAsync(a => a.IataCode == destIata, cancellationToken: cancellationToken);
                                        if (arrAirport == null)
                                        {
                                            arrAirport = new Airports
                                            {
                                                IataCode = destIata,
                                                Name = destName,
                                                City = destCity
                                            };
                                            await _unitOfWork.Repository<Airports>().AddAsync(arrAirport, cancellationToken);
                                            await _unitOfWork.SaveChangesAsync(cancellationToken);
                                        }
                                    }
                                }

                                // Tạo hoặc tìm Chuyến bay (Flights) làm lịch sử cache
                                var flightNumber = segment.TryGetProperty("operating_carrier_flight_number", out var fnVal) 
                                    ? fnVal.GetString() 
                                    : (segment.TryGetProperty("marketing_carrier_flight_number", out var mfnVal) ? mfnVal.GetString() : "N/A");

                                if (string.IsNullOrEmpty(flightNumber))
                                {
                                    flightNumber = "N/A";
                                }

                                var depTimeStr = segment.TryGetProperty("departing_at", out var depVal) ? depVal.GetString() : null;
                                var arrTimeStr = segment.TryGetProperty("arriving_at", out var arrVal) ? arrVal.GetString() : null;

                                DateTime depTime = !string.IsNullOrEmpty(depTimeStr) ? DateTime.Parse(depTimeStr) : DateTime.UtcNow;
                                DateTime arrTime = !string.IsNullOrEmpty(arrTimeStr) ? DateTime.Parse(arrTimeStr) : DateTime.UtcNow;

                                var flight = await _unitOfWork.Repository<WanderVN.Domain.Entities.Flights>().FindFirstOrDefaultAsync(
                                    f => f.FlightNumber == flightNumber && f.DepTime == depTime,
                                    cancellationToken: cancellationToken);

                                if (flight == null)
                                {
                                    flight = new WanderVN.Domain.Entities.Flights
                                    {
                                        AirlineId = airline?.Id,
                                        FlightNumber = flightNumber,
                                        DepAirportId = depAirport?.Id,
                                        ArrAirportId = arrAirport?.Id,
                                        DepTime = depTime,
                                        ArrTime = arrTime,
                                        Price = 0m,
                                        Status = "Scheduled"
                                    };
                                    await _unitOfWork.Repository<WanderVN.Domain.Entities.Flights>().AddAsync(flight, cancellationToken);
                                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                                }

                                // Lưu hành khách tương ứng với chặng bay này
                                foreach (var pax in request.Passengers)
                                {
                                    var seatNumber = FindSeatNumber(root, pax.Id, segmentId);
                                    
                                    var bookingFlight = new WanderVN.Domain.Entities.BookingFlights
                                    {
                                        BookingId = booking.Id,
                                        PassengerName = $"{pax.Title} {pax.GivenName} {pax.FamilyName}",
                                        PassportNumber = pax.PassportNumber,
                                        FlightId = flight.Id,
                                        SeatNumber = seatNumber
                                    };

                                    await _unitOfWork.Repository<WanderVN.Domain.Entities.BookingFlights>().AddAsync(bookingFlight, cancellationToken);
                                }
                                await _unitOfWork.SaveChangesAsync(cancellationToken);
                            }
                        }
                    }
                    parsedSlicesAndSegments = true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Lỗi khi phân tích và lưu chặng bay: {ex.Message}. Sử dụng phương thức dự phòng.");
            }

            // Phương án dự phòng: Nếu phân tích chặng bay thất bại, lưu thông tin tối thiểu
            if (!parsedSlicesAndSegments)
            {
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

            if (string.IsNullOrEmpty(recipientEmail) && request.UserId.HasValue)
            {
                var user = await _unitOfWork.Users.FindFirstOrDefaultAsync(u => u.Id == request.UserId.Value, cancellationToken: cancellationToken);
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

    private string? FindSeatNumber(JsonElement root, string passengerId, string segmentId)
    {
        // Kiểm tra phương án 1: Thông tin ghế lưu trong danh sách hành khách của Segment
        if (root.TryGetProperty("data", out var data) && data.TryGetProperty("slices", out var slices))
        {
            foreach (var slice in slices.EnumerateArray())
            {
                if (slice.TryGetProperty("segments", out var segments))
                {
                    foreach (var segment in segments.EnumerateArray())
                    {
                        if (segment.TryGetProperty("id", out var segIdProp) && segIdProp.GetString() == segmentId)
                        {
                            if (segment.TryGetProperty("passengers", out var segmentPassengers))
                            {
                                foreach (var segPax in segmentPassengers.EnumerateArray())
                                {
                                    string? segPaxId = null;
                                    if (segPax.TryGetProperty("passenger_id", out var paxIdProp))
                                        segPaxId = paxIdProp.GetString();
                                    else if (segPax.TryGetProperty("id", out var idProp))
                                        segPaxId = idProp.GetString();

                                    if (segPaxId == passengerId)
                                    {
                                        if (segPax.TryGetProperty("seat", out var seatObj) && seatObj.ValueKind == JsonValueKind.Object)
                                        {
                                            if (seatObj.TryGetProperty("designator", out var desProp))
                                            {
                                                return desProp.GetString();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Kiểm tra phương án 2: Thông tin dịch vụ chọn ghế ngoài phần slices
        if (root.TryGetProperty("data", out var rootData) && rootData.TryGetProperty("services", out var services))
        {
            foreach (var svc in services.EnumerateArray())
            {
                if (svc.TryGetProperty("type", out var typeProp) && typeProp.GetString() == "seat")
                {
                    bool segmentMatches = false;
                    if (svc.TryGetProperty("segment_ids", out var segIds))
                    {
                        foreach (var sId in segIds.EnumerateArray())
                        {
                            if (sId.GetString() == segmentId)
                            {
                                segmentMatches = true;
                                break;
                            }
                        }
                    }

                    if (segmentMatches)
                    {
                        bool passengerMatches = false;
                        if (svc.TryGetProperty("passenger_ids", out var paxIds))
                        {
                            foreach (var pId in paxIds.EnumerateArray())
                            {
                                if (pId.GetString() == passengerId)
                                {
                                    passengerMatches = true;
                                    break;
                                }
                            }
                        }

                        if (passengerMatches)
                        {
                            if (svc.TryGetProperty("metadata", out var meta) && meta.ValueKind == JsonValueKind.Object)
                            {
                                if (meta.TryGetProperty("designator", out var desProp))
                                {
                                    return desProp.GetString();
                                }
                            }
                        }
                    }
                }
            }
        }

        return null;
    }
}
