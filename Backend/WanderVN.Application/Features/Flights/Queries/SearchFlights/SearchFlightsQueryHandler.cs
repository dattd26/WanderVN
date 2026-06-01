using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Flights.Queries.SearchFlights;

/// <summary>
/// Handler xử lý logic tìm kiếm chuyến bay thông qua việc gọi IDuffelService.
/// </summary>
public class SearchFlightsQueryHandler : IRequestHandler<SearchFlightsQuery, List<FlightOfferDto>>
{
    private readonly IDuffelService _duffelService;
    private readonly IFlightSearchCacheService _flightSearchCacheService;
    private readonly IUnitOfWork _unitOfWork;

    public SearchFlightsQueryHandler(IDuffelService duffelService, IFlightSearchCacheService flightSearchCacheService, IUnitOfWork unitOfWork)
    {
        _duffelService = duffelService;
        _flightSearchCacheService = flightSearchCacheService;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<FlightOfferDto>> Handle(SearchFlightsQuery request, CancellationToken cancellationToken)
    {
        // Chuyển đổi Query thành DTO của service bao gồm cấu hình return_offers
        var duffelRequest = new DuffelOfferRequestDto
        {
            Origin = request.Origin,
            Destination = request.Destination,
            DepartureDate = request.DepartureDate,
            PassengerType = request.PassengerType,
            ReturnOffers = request.ReturnOffers,
            CabinClass = request.CabinClass,
            ReturnDate = request.ReturnDate
        };

        List<FlightOfferDto> offers;
        var cachedOffers = await _flightSearchCacheService.GetAsync(duffelRequest, cancellationToken);
        if (cachedOffers is not null)
        {
            offers = cachedOffers;
        }
        else
        {
            // Gửi yêu cầu qua Service trực tiếp tới Duffel Sandbox với chặng bay thật người dùng tìm kiếm
            var responseJson = await _duffelService.SearchOffersAsync(duffelRequest);
            // Thực hiện parse JSON từ Duffel và ánh xạ (map) sang List<FlightOfferDto> tối giản
            offers = ParseDuffelOffers(responseJson, request.Origin, request.Destination, request.DepartureDate);

            await _flightSearchCacheService.SetAsync(duffelRequest, offers, responseJson, cancellationToken);
        }

        // Đọc tỷ lệ markup từ SystemSettings (key: "FlightMarkupPercent", mặc định 5%)
        decimal markupPercent = 5m;
        var markupSetting = await _unitOfWork.SystemSettings
            .FindFirstOrDefaultAsync(s => s.Key == "FlightMarkupPercent", cancellationToken: cancellationToken);
        if (markupSetting != null && decimal.TryParse(markupSetting.Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var mp))
            markupPercent = mp;

        // Đọc phí cổng thanh toán từ SystemSettings theo phương thức (mặc định VNPayFeeVnd là 10.000đ)
        decimal paymentFeeVnd = 10000m;
        var feeSetting = await _unitOfWork.SystemSettings
            .FindFirstOrDefaultAsync(s => s.Key == "VNPayFeeVnd", cancellationToken: cancellationToken);
        if (feeSetting != null && decimal.TryParse(feeSetting.Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var fee))
            paymentFeeVnd = fee;

        // Áp dụng markup và phí thanh toán vào từng chuyến bay
        foreach (var offer in offers)
        {
            decimal duffelAmountVnd = Common.Utils.CurrencyConverter.ConvertUsdToVnd(offer.TotalAmount);
            decimal markupAmountVnd = Math.Round(duffelAmountVnd * markupPercent / 100m);
            decimal customerTotalVnd = duffelAmountVnd + markupAmountVnd + paymentFeeVnd;
            offer.TotalAmount = Common.Utils.CurrencyConverter.ConvertVndToUsd(customerTotalVnd);
        }

        return offers;
    }

    /// <summary>
    /// Phân tích cú pháp chuỗi phản hồi JSON từ Duffel và ánh xạ (map) sang danh sách FlightOfferDto tinh gọn.
    /// Không áp dụng bất kỳ ánh xạ ảo hóa nào, sử dụng trực tiếp dữ liệu từ Duffel Sandbox API.
    /// Đồng thời tìm kiếm và gắn kèm thông tin Offer của hãng Duffel Airways (ZZ) để hỗ trợ Đặt vé sandbox.
    /// </summary>
    private static List<FlightOfferDto> ParseDuffelOffers(string responseJson, string origin, string destination, string departureDateStr)
    {
        var resultList = new List<FlightOfferDto>();
        if (string.IsNullOrEmpty(responseJson)) return resultList;

        try
        {
            using var doc = JsonDocument.Parse(responseJson);
            var root = doc.RootElement;

            if (!root.TryGetProperty("data", out var dataProp) || dataProp.ValueKind != JsonValueKind.Object) return resultList;
            if (!dataProp.TryGetProperty("offers", out var offersProp) || offersProp.ValueKind != JsonValueKind.Array) return resultList;

            // 1. Quét tìm Offer của hãng Duffel Airways (mã ZZ) chuyên dùng cho việc đặt vé
            string duffelAirwaysOfferId = string.Empty;
            string duffelAirwaysPassengerId = string.Empty;

            foreach (var offer in offersProp.EnumerateArray())
            {
                if (offer.ValueKind != JsonValueKind.Object) continue;

                string currentOfferId = string.Empty;
                if (offer.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
                {
                    currentOfferId = idProp.GetString() ?? string.Empty;
                }

                string currentPassengerId = string.Empty;
                if (offer.TryGetProperty("passengers", out var passengersProp) && passengersProp.ValueKind == JsonValueKind.Array && passengersProp.GetArrayLength() > 0)
                {
                    var firstPassenger = passengersProp[0];
                    if (firstPassenger.ValueKind == JsonValueKind.Object && firstPassenger.TryGetProperty("id", out var passIdProp) && passIdProp.ValueKind == JsonValueKind.String)
                    {
                        currentPassengerId = passIdProp.GetString() ?? string.Empty;
                    }
                }

                bool isDuffelAirways = false;
                if (offer.TryGetProperty("slices", out var slicesProp) && slicesProp.ValueKind == JsonValueKind.Array && slicesProp.GetArrayLength() > 0)
                {
                    var slice = slicesProp[0];
                    if (slice.ValueKind == JsonValueKind.Object && slice.TryGetProperty("segments", out var segmentsProp) && segmentsProp.ValueKind == JsonValueKind.Array && segmentsProp.GetArrayLength() > 0)
                    {
                        var segment = segmentsProp[0];
                        if (segment.ValueKind == JsonValueKind.Object && segment.TryGetProperty("operating_carrier", out var carrierProp) && carrierProp.ValueKind == JsonValueKind.Object)
                        {
                            if (carrierProp.TryGetProperty("iata_code", out var cCodeProp) && cCodeProp.ValueKind == JsonValueKind.String)
                            {
                                if (cCodeProp.GetString() == "ZZ")
                                {
                                    isDuffelAirways = true;
                                }
                            }
                        }
                    }
                }

                if (isDuffelAirways && !string.IsNullOrEmpty(currentOfferId))
                {
                    duffelAirwaysOfferId = currentOfferId;
                    duffelAirwaysPassengerId = currentPassengerId;
                    break;
                }
            }

            // Nếu không tìm thấy Duffel Airways trong danh sách, lấy phần tử đầu tiên làm dự phòng
            if (string.IsNullOrEmpty(duffelAirwaysOfferId) && offersProp.GetArrayLength() > 0)
            {
                var firstOffer = offersProp[0];
                if (firstOffer.ValueKind == JsonValueKind.Object)
                {
                    if (firstOffer.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
                    {
                        duffelAirwaysOfferId = idProp.GetString() ?? string.Empty;
                    }
                    if (firstOffer.TryGetProperty("passengers", out var passengersProp) && passengersProp.ValueKind == JsonValueKind.Array && passengersProp.GetArrayLength() > 0)
                    {
                        var firstPassenger = passengersProp[0];
                        if (firstPassenger.ValueKind == JsonValueKind.Object && firstPassenger.TryGetProperty("id", out var passIdProp) && passIdProp.ValueKind == JsonValueKind.String)
                        {
                            duffelAirwaysPassengerId = passIdProp.GetString() ?? string.Empty;
                        }
                    }
                }
            }

            // 2. Parse chi tiết từng Offer để đưa lên Frontend
            foreach (var offer in offersProp.EnumerateArray())
            {
                if (offer.ValueKind != JsonValueKind.Object) continue;
                var dto = new FlightOfferDto();

                // Trích xuất ID ưu đãi thực tế từ Duffel
                if (offer.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
                {
                    dto.Id = idProp.GetString() ?? string.Empty;
                }

                // Gắn kèm các ID của hãng Duffel Airways để hỗ trợ Frontend gửi lên lúc đặt chỗ
                dto.DuffelAirwaysOfferId = duffelAirwaysOfferId;
                dto.DuffelAirwaysPassengerId = duffelAirwaysPassengerId;

                // Trích xuất giá cả thực tế từ Duffel
                if (offer.TryGetProperty("total_amount", out var amountProp) && amountProp.ValueKind == JsonValueKind.String)
                {
                    if (decimal.TryParse(amountProp.GetString(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var parsedAmount))
                    {
                        dto.TotalAmount = parsedAmount;
                    }
                }

                if (offer.TryGetProperty("total_currency", out var currencyProp) && currencyProp.ValueKind == JsonValueKind.String)
                {
                    dto.TotalCurrency = currencyProp.GetString() ?? "USD";
                }

                // Trích xuất ID Hành khách tương ứng
                if (offer.TryGetProperty("passengers", out var passengersProp) && passengersProp.ValueKind == JsonValueKind.Array && passengersProp.GetArrayLength() > 0)
                {
                    var firstPassenger = passengersProp[0];
                    if (firstPassenger.ValueKind == JsonValueKind.Object && firstPassenger.TryGetProperty("id", out var passIdProp) && passIdProp.ValueKind == JsonValueKind.String)
                    {
                        dto.PassengerId = passIdProp.GetString() ?? string.Empty;
                    }
                }

                // Trích xuất thông tin Slice (chặng bay chính)
                if (offer.TryGetProperty("slices", out var slicesProp) && slicesProp.ValueKind == JsonValueKind.Array && slicesProp.GetArrayLength() > 0)
                {
                    var slice = slicesProp[0]; // Chỉ hiển thị chặng chiều đi

                    if (slice.ValueKind == JsonValueKind.Object)
                    {
                        if (slice.TryGetProperty("duration", out var durProp) && durProp.ValueKind == JsonValueKind.String)
                        {
                            dto.Duration = durProp.GetString() ?? string.Empty;
                        }

                        // Điểm đi / Điểm đến chặng bay
                        if (slice.TryGetProperty("origin", out var originProp) && originProp.ValueKind == JsonValueKind.Object)
                        {
                            if (originProp.TryGetProperty("iata_code", out var origCodeProp) && origCodeProp.ValueKind == JsonValueKind.String) dto.OriginCode = origCodeProp.GetString() ?? string.Empty;
                            if (originProp.TryGetProperty("name", out var origNameProp) && origNameProp.ValueKind == JsonValueKind.String) dto.OriginName = origNameProp.GetString() ?? string.Empty;
                        }

                        if (slice.TryGetProperty("destination", out var destProp) && destProp.ValueKind == JsonValueKind.Object)
                        {
                            if (destProp.TryGetProperty("iata_code", out var destCodeProp) && destCodeProp.ValueKind == JsonValueKind.String) dto.DestinationCode = destCodeProp.GetString() ?? string.Empty;
                            if (destProp.TryGetProperty("name", out var destNameProp) && destNameProp.ValueKind == JsonValueKind.String) dto.DestinationName = destNameProp.GetString() ?? string.Empty;
                        }

                        // Trích xuất thông tin các phân đoạn (Segments)
                        if (slice.TryGetProperty("segments", out var segmentsProp) && segmentsProp.ValueKind == JsonValueKind.Array && segmentsProp.GetArrayLength() > 0)
                        {
                            var segment = segmentsProp[0]; // Phân đoạn cất cánh đầu tiên

                            if (segment.ValueKind == JsonValueKind.Object)
                            {
                                if (segment.TryGetProperty("departing_at", out var depProp) && depProp.ValueKind == JsonValueKind.String && DateTime.TryParse(depProp.GetString(), out var depTime))
                                {
                                    dto.DepartingAt = depTime;
                                }

                                // Lấy thời gian hạ cánh của phân đoạn cuối cùng trong slice
                                var lastSegment = segmentsProp[segmentsProp.GetArrayLength() - 1];
                                if (lastSegment.ValueKind == JsonValueKind.Object && lastSegment.TryGetProperty("arriving_at", out var arrProp) && arrProp.ValueKind == JsonValueKind.String && DateTime.TryParse(arrProp.GetString(), out var arrTime))
                                {
                                    dto.ArrivingAt = arrTime;
                                }

                                // Trích xuất thông tin hãng hàng không vận hành (operating_carrier)
                                if (segment.TryGetProperty("operating_carrier", out var carrierProp) && carrierProp.ValueKind == JsonValueKind.Object)
                                {
                                    if (carrierProp.TryGetProperty("iata_code", out var cCodeProp) && cCodeProp.ValueKind == JsonValueKind.String) dto.CarrierCode = cCodeProp.GetString() ?? string.Empty;
                                    if (carrierProp.TryGetProperty("name", out var cNameProp) && cNameProp.ValueKind == JsonValueKind.String) dto.CarrierName = cNameProp.GetString() ?? string.Empty;
                                    if (carrierProp.TryGetProperty("logo_symbol_url", out var cLogoProp) && cLogoProp.ValueKind == JsonValueKind.String) dto.CarrierLogoUrl = cLogoProp.GetString() ?? string.Empty;
                                }

                                // Trích xuất dòng máy bay vận hành (aircraft)
                                if (segment.TryGetProperty("aircraft", out var aircraftProp) && aircraftProp.ValueKind == JsonValueKind.Object)
                                {
                                    if (aircraftProp.TryGetProperty("name", out var airNameProp) && airNameProp.ValueKind == JsonValueKind.String) dto.AircraftName = airNameProp.GetString() ?? string.Empty;
                                }
                            }
                        }
                    }
                }

                resultList.Add(dto);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Lỗi parse JSON Duffel: {ex.Message}");
        }

        return resultList;
    }
}
