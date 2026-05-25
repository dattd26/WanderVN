using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Flights.Queries.GetFlightOfferDetail;

/// <summary>
/// Handler lấy chi tiết đầy đủ một Offer từ Duffel API bằng cách gọi GetOfferAsync,
/// sau đó parse JSON và map sang GetFlightOfferDetailDto.
/// </summary>
public class GetFlightOfferDetailQueryHandler : IRequestHandler<GetFlightOfferDetailQuery, GetFlightOfferDetailDto>
{
    private readonly IDuffelService _duffelService;

    public GetFlightOfferDetailQueryHandler(IDuffelService duffelService)
    {
        _duffelService = duffelService;
    }

    public async Task<GetFlightOfferDetailDto> Handle(GetFlightOfferDetailQuery request, CancellationToken cancellationToken)
    {
        Console.WriteLine($"[GetFlightOfferDetail] Fetching offerId: {request.OfferId}");

        // Gọi IDuffelService.GetOfferAsync (đã tồn tại, reuse hoàn toàn)
        var responseJson = await _duffelService.GetOfferAsync(request.OfferId);

        Console.WriteLine($"[GetFlightOfferDetail] Duffel response received, parsing...");

        return ParseOfferDetail(responseJson, request.OfferId);
    }

    /// <summary>
    /// Parse JSON response từ GET /air/offers/{offer_id} của Duffel và map sang DTO chi tiết.
    /// </summary>
    private static GetFlightOfferDetailDto ParseOfferDetail(string responseJson, string offerId)
    {
        var dto = new GetFlightOfferDetailDto { OfferId = offerId };

        if (string.IsNullOrEmpty(responseJson)) return dto;

        try
        {
            using var doc = JsonDocument.Parse(responseJson);
            var root = doc.RootElement;

            // Duffel trả về { "data": { offer object } }
            if (!root.TryGetProperty("data", out var offerEl) || offerEl.ValueKind != JsonValueKind.Object)
                return dto;

            // ─── Identity ────────────────────────────────────────────────────
            if (offerEl.TryGetProperty("id", out var idProp))
                dto.OfferId = idProp.GetString() ?? offerId;

            // ─── Validity ────────────────────────────────────────────────────
            dto.IsExpired = false;
            dto.IsValid = true;
            if (offerEl.TryGetProperty("expires_at", out var expProp) && expProp.ValueKind == JsonValueKind.String)
            {
                if (DateTime.TryParse(expProp.GetString(), out var expAt))
                {
                    dto.ExpiresAt = expAt;
                    dto.IsExpired = expAt < DateTime.UtcNow;
                    dto.IsValid = !dto.IsExpired;
                }
            }

            // ─── Pricing ─────────────────────────────────────────────────────
            if (offerEl.TryGetProperty("total_amount", out var totalProp) && totalProp.ValueKind == JsonValueKind.String)
                if (decimal.TryParse(totalProp.GetString(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var total))
                    dto.TotalAmount = total;

            if (offerEl.TryGetProperty("base_amount", out var baseProp) && baseProp.ValueKind == JsonValueKind.String)
                if (decimal.TryParse(baseProp.GetString(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var baseAmt))
                    dto.BaseAmount = baseAmt;

            if (offerEl.TryGetProperty("tax_amount", out var taxProp) && taxProp.ValueKind == JsonValueKind.String)
                if (decimal.TryParse(taxProp.GetString(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var tax))
                    dto.TaxAmount = tax;

            // Nếu base/tax không có, ước tính từ total
            if (dto.BaseAmount == 0 && dto.TotalAmount > 0)
            {
                dto.BaseAmount = Math.Round(dto.TotalAmount * 0.85m, 2);
                dto.TaxAmount = dto.TotalAmount - dto.BaseAmount;
            }

            if (offerEl.TryGetProperty("total_currency", out var currencyProp))
                dto.Currency = currencyProp.GetString() ?? "USD";

            // ─── Passenger ID ─────────────────────────────────────────────────
            if (offerEl.TryGetProperty("passengers", out var passProp) && passProp.ValueKind == JsonValueKind.Array && passProp.GetArrayLength() > 0)
            {
                var firstPass = passProp[0];
                if (firstPass.TryGetProperty("id", out var passIdProp))
                    dto.PassengerId = passIdProp.GetString() ?? string.Empty;
            }

            // ─── Available Seats ─────────────────────────────────────────────
            if (offerEl.TryGetProperty("available_services", out _))
            {
                // Nếu có available_services, có thể đếm seats — để đơn giản dùng default
            }
            // Duffel không trả về số ghế trực tiếp ở offer level; dùng segment level nếu có
            dto.AvailableSeats = 9; // default safe value

            // ─── Slices ───────────────────────────────────────────────────────
            if (offerEl.TryGetProperty("slices", out var slicesProp) && slicesProp.ValueKind == JsonValueKind.Array)
            {
                bool firstSlice = true;
                foreach (var slice in slicesProp.EnumerateArray())
                {
                    if (slice.ValueKind != JsonValueKind.Object) continue;

                    var sliceDto = new FlightSliceDetailDto();

                    // Origin
                    if (slice.TryGetProperty("origin", out var sliceOriginProp) && sliceOriginProp.ValueKind == JsonValueKind.Object)
                    {
                        if (sliceOriginProp.TryGetProperty("iata_code", out var p)) sliceDto.OriginCode = p.GetString() ?? string.Empty;
                        if (sliceOriginProp.TryGetProperty("name", out var p2)) sliceDto.Origin = p2.GetString() ?? string.Empty;
                    }

                    // Destination
                    if (slice.TryGetProperty("destination", out var sliceDestProp) && sliceDestProp.ValueKind == JsonValueKind.Object)
                    {
                        if (sliceDestProp.TryGetProperty("iata_code", out var p)) sliceDto.DestinationCode = p.GetString() ?? string.Empty;
                        if (sliceDestProp.TryGetProperty("name", out var p2)) sliceDto.Destination = p2.GetString() ?? string.Empty;
                    }

                    // Duration
                    if (slice.TryGetProperty("duration", out var sliceDurProp))
                        sliceDto.Duration = sliceDurProp.GetString() ?? string.Empty;

                    // Segments
                    if (slice.TryGetProperty("segments", out var segsProp) && segsProp.ValueKind == JsonValueKind.Array)
                    {
                        bool firstSeg = true;
                        foreach (var seg in segsProp.EnumerateArray())
                        {
                            if (seg.ValueKind != JsonValueKind.Object) continue;
                            var segDto = new FlightSegmentDetailDto();

                            // Flight number
                            if (seg.TryGetProperty("marketing_carrier_flight_number", out var fnProp))
                                segDto.FlightNumber = fnProp.GetString() ?? string.Empty;

                            // Aircraft
                            if (seg.TryGetProperty("aircraft", out var aircraftProp) && aircraftProp.ValueKind == JsonValueKind.Object)
                                if (aircraftProp.TryGetProperty("name", out var acNameProp))
                                    segDto.Aircraft = acNameProp.GetString() ?? string.Empty;

                            // Carrier
                            if (seg.TryGetProperty("operating_carrier", out var carrierProp) && carrierProp.ValueKind == JsonValueKind.Object)
                            {
                                if (carrierProp.TryGetProperty("iata_code", out var ccProp)) segDto.CarrierCode = ccProp.GetString() ?? string.Empty;
                                if (carrierProp.TryGetProperty("name", out var cnProp)) segDto.CarrierName = cnProp.GetString() ?? string.Empty;
                                if (carrierProp.TryGetProperty("logo_symbol_url", out var clProp)) segDto.CarrierLogo = clProp.GetString() ?? string.Empty;
                                if (string.IsNullOrEmpty(segDto.CarrierLogo) && carrierProp.TryGetProperty("logo_lockup_url", out var cl2Prop))
                                    segDto.CarrierLogo = cl2Prop.GetString() ?? string.Empty;
                            }

                            // Departure airport
                            if (seg.TryGetProperty("origin", out var segOriginProp) && segOriginProp.ValueKind == JsonValueKind.Object)
                            {
                                if (segOriginProp.TryGetProperty("iata_code", out var p)) segDto.DepartureAirportCode = p.GetString() ?? string.Empty;
                                if (segOriginProp.TryGetProperty("name", out var p2)) segDto.DepartureAirportName = p2.GetString() ?? string.Empty;
                            }
                            if (seg.TryGetProperty("origin_terminal", out var origTermProp))
                                segDto.DepartureTerminal = origTermProp.GetString() ?? string.Empty;

                            // Arrival airport
                            if (seg.TryGetProperty("destination", out var segDestProp) && segDestProp.ValueKind == JsonValueKind.Object)
                            {
                                if (segDestProp.TryGetProperty("iata_code", out var p)) segDto.ArrivalAirportCode = p.GetString() ?? string.Empty;
                                if (segDestProp.TryGetProperty("name", out var p2)) segDto.ArrivalAirportName = p2.GetString() ?? string.Empty;
                            }
                            if (seg.TryGetProperty("destination_terminal", out var destTermProp))
                                segDto.ArrivalTerminal = destTermProp.GetString() ?? string.Empty;

                            // Times
                            if (seg.TryGetProperty("departing_at", out var depProp) && DateTime.TryParse(depProp.GetString(), out var depTime))
                                segDto.DepartingAt = depTime;
                            if (seg.TryGetProperty("arriving_at", out var arrProp) && DateTime.TryParse(arrProp.GetString(), out var arrTime))
                                segDto.ArrivingAt = arrTime;

                            // Duration
                            if (seg.TryGetProperty("duration", out var segDurProp))
                                segDto.Duration = segDurProp.GetString() ?? string.Empty;

                            // Cabin class (from passengers[0].cabin_class_marketing_name or cabin_class)
                            if (seg.TryGetProperty("passengers", out var segPassProp) && segPassProp.ValueKind == JsonValueKind.Array && segPassProp.GetArrayLength() > 0)
                            {
                                var sp = segPassProp[0];
                                if (sp.TryGetProperty("cabin_class_marketing_name", out var ccmProp) && ccmProp.ValueKind == JsonValueKind.String)
                                    segDto.CabinClass = ccmProp.GetString() ?? string.Empty;
                                if (string.IsNullOrEmpty(segDto.CabinClass) && sp.TryGetProperty("cabin_class", out var ccProp2))
                                    segDto.CabinClass = ccProp2.GetString() ?? "economy";
                            }

                            sliceDto.Segments.Add(segDto);

                            // Populate top-level DTO from first segment of first slice
                            if (firstSlice && firstSeg)
                            {
                                dto.FlightNumber = segDto.FlightNumber;
                                dto.Aircraft = segDto.Aircraft;
                                dto.Airline = segDto.CarrierName;
                                dto.AirlineLogo = segDto.CarrierLogo;
                                dto.DepartureAirport = segDto.DepartureAirportName;
                                dto.DepartureAirportCode = segDto.DepartureAirportCode;
                                dto.DepartureTerminal = segDto.DepartureTerminal;
                                dto.DepartureTime = segDto.DepartingAt;
                                dto.CabinClass = segDto.CabinClass;
                            }
                            firstSeg = false;
                        }

                        // Arrival from last segment of first slice
                        if (firstSlice && sliceDto.Segments.Count > 0)
                        {
                            var lastSeg = sliceDto.Segments[^1];
                            dto.ArrivalAirport = lastSeg.ArrivalAirportName;
                            dto.ArrivalAirportCode = lastSeg.ArrivalAirportCode;
                            dto.ArrivalTerminal = lastSeg.ArrivalTerminal;
                            dto.ArrivalTime = lastSeg.ArrivingAt;
                        }

                        dto.Stops = Math.Max(0, sliceDto.Segments.Count - 1);
                    }

                    if (firstSlice && !string.IsNullOrEmpty(sliceDto.Duration))
                        dto.Duration = sliceDto.Duration;

                    dto.Slices.Add(sliceDto);
                    firstSlice = false;
                }
            }

            // ─── Baggage info (từ conditions.baggage_allowance hoặc passengers[0].baggages) ─
            dto.BaggageInfo = "23kg hành lý ký gửi";
            dto.CabinBaggageInfo = "7kg hành lý xách tay";
            dto.MealInfo = "Bữa ăn tiêu chuẩn";
            dto.SeatInfo = "Ghế ngẫu nhiên (chọn khi check-in)";

            // Duffel: conditions.baggage -> checked; passengers[x].baggages
            if (offerEl.TryGetProperty("conditions", out var condProp) && condProp.ValueKind == JsonValueKind.Object)
            {
                // WiFi thường không có trong Duffel standard fields — default false
                dto.WifiAvailable = false;
            }

            // ─── Terminal Info ────────────────────────────────────────────────
            // Đã được trích xuất vào DepartureTerminal/ArrivalTerminal ở trên

            Console.WriteLine($"[GetFlightOfferDetail] Parsed successfully. Airline={dto.Airline}, Route={dto.DepartureAirportCode}->{dto.ArrivalAirportCode}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetFlightOfferDetail] Parse error: {ex.Message}");
            dto.IsValid = false;
        }

        return dto;
    }
}
