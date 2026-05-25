using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Features.Bookings.Commands.CreateFlightBooking;

public class CreateFlightBookingCommandHandler : IRequestHandler<CreateFlightBookingCommand, FlightBookingResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IDuffelService _duffelService;

    public CreateFlightBookingCommandHandler(IApplicationDbContext dbContext, IDuffelService duffelService)
    {
        _dbContext = dbContext;
        _duffelService = duffelService;
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
        decimal totalPriceInVnd = WanderVN.Application.Common.Utils.CurrencyConverter.ConvertUsdToVnd(request.TotalPrice);

        var booking = new WanderVN.Domain.Entities.Bookings
        {
            UserId = request.UserId,
            BookingCode = duffelOrderId, // Sử dụng Duffel Order ID làm Mã đặt vé
            ServiceType = "Flight",
            TotalPrice = totalPriceInVnd,
            Status = "Pending", // Trạng thái chờ thanh toán
            PaymentStatus = "Unpaid",
            CreatedAt = DateTimeOffset.UtcNow
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
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            // Bắt lỗi cập nhật DB và ném ra chi tiết lỗi bên trong (Inner Exception) để dễ dàng chẩn đoán lỗi
            throw new System.Exception($"Lỗi lưu cơ sở dữ liệu: {ex.Message}. Chi tiết lỗi SQL Server: {ex.InnerException?.Message}", ex);
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
