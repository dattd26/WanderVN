using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Flights.Queries.GetFlightOfferDetail;

public class GetFlightOfferDetailQueryHandler : IRequestHandler<GetFlightOfferDetailQuery, FlightOfferDetailDto>
{
    private readonly IDuffelService _duffelService;

    public GetFlightOfferDetailQueryHandler(IDuffelService duffelService)
    {
        _duffelService = duffelService;
    }

    public async Task<FlightOfferDetailDto> Handle(GetFlightOfferDetailQuery request, CancellationToken cancellationToken)
    {
        var responseJson = await _duffelService.GetOfferAsync(request.OfferId);
        return ParseOfferDetail(responseJson);
    }

    private static FlightOfferDetailDto ParseOfferDetail(string responseJson)
    {
        var dto = new FlightOfferDetailDto();
        if (string.IsNullOrEmpty(responseJson)) return dto;

        try
        {
            using var doc = JsonDocument.Parse(responseJson);
            var root = doc.RootElement;
            if (!root.TryGetProperty("data", out var dataProp) || dataProp.ValueKind != JsonValueKind.Object) return dto;

            if (dataProp.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
            {
                dto.Id = idProp.GetString() ?? string.Empty;
            }

            if (dataProp.TryGetProperty("total_amount", out var amountProp) && amountProp.ValueKind == JsonValueKind.String)
            {
                if (decimal.TryParse(amountProp.GetString(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var parsedAmount))
                {
                    dto.TotalAmount = parsedAmount;
                }
            }

            if (dataProp.TryGetProperty("total_currency", out var currencyProp) && currencyProp.ValueKind == JsonValueKind.String)
            {
                dto.TotalCurrency = currencyProp.GetString() ?? "USD";
            }

            if (dataProp.TryGetProperty("status", out var statusProp) && statusProp.ValueKind == JsonValueKind.String)
            {
                dto.Status = statusProp.GetString() ?? string.Empty;
            }

            if (dataProp.TryGetProperty("expires_at", out var expiresProp) && expiresProp.ValueKind == JsonValueKind.String)
            {
                dto.ExpiresAt = expiresProp.GetString() ?? string.Empty;
                if (DateTime.TryParse(dto.ExpiresAt, out var parsedExpiry))
                {
                    dto.IsExpired = parsedExpiry < DateTime.UtcNow;
                }
            }

            if (dataProp.TryGetProperty("available_seats", out var availableSeatsProp))
            {
                switch (availableSeatsProp.ValueKind)
                {
                    case JsonValueKind.Number:
                        dto.AvailableSeats = availableSeatsProp.GetInt32();
                        break;
                    case JsonValueKind.String when int.TryParse(availableSeatsProp.GetString(), out var seats):
                        dto.AvailableSeats = seats;
                        break;
                }
            }

            if (dataProp.TryGetProperty("passengers", out var passengersProp) && passengersProp.ValueKind == JsonValueKind.Array && passengersProp.GetArrayLength() > 0)
            {
                var firstPassenger = passengersProp[0];
                if (firstPassenger.ValueKind == JsonValueKind.Object && firstPassenger.TryGetProperty("id", out var passIdProp) && passIdProp.ValueKind == JsonValueKind.String)
                {
                    dto.PassengerId = passIdProp.GetString() ?? string.Empty;
                }
            }

            if (dataProp.TryGetProperty("slices", out var slicesProp) && slicesProp.ValueKind == JsonValueKind.Array && slicesProp.GetArrayLength() > 0)
            {
                var slice = slicesProp[0];
                if (slice.ValueKind == JsonValueKind.Object)
                {
                    if (slice.TryGetProperty("duration", out var durationProp) && durationProp.ValueKind == JsonValueKind.String)
                    {
                        dto.Duration = durationProp.GetString() ?? string.Empty;
                    }

                    if (slice.TryGetProperty("origin", out var originProp) && originProp.ValueKind == JsonValueKind.Object)
                    {
                        if (originProp.TryGetProperty("iata_code", out var originCodeProp) && originCodeProp.ValueKind == JsonValueKind.String)
                            dto.OriginCode = originCodeProp.GetString() ?? string.Empty;
                        if (originProp.TryGetProperty("name", out var originNameProp) && originNameProp.ValueKind == JsonValueKind.String)
                            dto.OriginName = originNameProp.GetString() ?? string.Empty;
                    }

                    if (slice.TryGetProperty("destination", out var destinationProp) && destinationProp.ValueKind == JsonValueKind.Object)
                    {
                        if (destinationProp.TryGetProperty("iata_code", out var destCodeProp) && destCodeProp.ValueKind == JsonValueKind.String)
                            dto.DestinationCode = destCodeProp.GetString() ?? string.Empty;
                        if (destinationProp.TryGetProperty("name", out var destNameProp) && destNameProp.ValueKind == JsonValueKind.String)
                            dto.DestinationName = destNameProp.GetString() ?? string.Empty;
                    }

                    if (slice.TryGetProperty("segments", out var segmentsProp) && segmentsProp.ValueKind == JsonValueKind.Array && segmentsProp.GetArrayLength() > 0)
                    {
                        var firstSegment = segmentsProp[0];
                        if (firstSegment.ValueKind == JsonValueKind.Object)
                        {
                            if (firstSegment.TryGetProperty("departing_at", out var departingAtProp) && departingAtProp.ValueKind == JsonValueKind.String && DateTime.TryParse(departingAtProp.GetString(), out var departingAt))
                            {
                                dto.DepartingAt = departingAt;
                            }

                            var lastSegment = segmentsProp[segmentsProp.GetArrayLength() - 1];
                            if (lastSegment.ValueKind == JsonValueKind.Object && lastSegment.TryGetProperty("arriving_at", out var arrivingAtProp) && arrivingAtProp.ValueKind == JsonValueKind.String && DateTime.TryParse(arrivingAtProp.GetString(), out var arrivingAt))
                            {
                                dto.ArrivingAt = arrivingAt;
                            }

                            if (firstSegment.TryGetProperty("operating_carrier", out var carrierProp) && carrierProp.ValueKind == JsonValueKind.Object)
                            {
                                if (carrierProp.TryGetProperty("iata_code", out var carrierCodeProp) && carrierCodeProp.ValueKind == JsonValueKind.String)
                                    dto.CarrierCode = carrierCodeProp.GetString() ?? string.Empty;
                                if (carrierProp.TryGetProperty("name", out var carrierNameProp) && carrierNameProp.ValueKind == JsonValueKind.String)
                                    dto.CarrierName = carrierNameProp.GetString() ?? string.Empty;
                                if (carrierProp.TryGetProperty("logo_symbol_url", out var carrierLogoProp) && carrierLogoProp.ValueKind == JsonValueKind.String)
                                    dto.CarrierLogoUrl = carrierLogoProp.GetString() ?? string.Empty;
                            }

                            if (firstSegment.TryGetProperty("aircraft", out var aircraftProp) && aircraftProp.ValueKind == JsonValueKind.Object && aircraftProp.TryGetProperty("name", out var aircraftNameProp) && aircraftNameProp.ValueKind == JsonValueKind.String)
                            {
                                dto.AircraftName = aircraftNameProp.GetString() ?? string.Empty;
                            }
                        }
                    }
                }
            }

            if (string.IsNullOrEmpty(dto.ValidationStatus))
            {
                dto.ValidationStatus = dto.IsExpired ? "Offer đã hết hạn" : "Offer hợp lệ";
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Lỗi parse offer detail từ Duffel: {ex.Message}");
        }

        return dto;
    }
}
