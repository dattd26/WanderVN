using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Flights.Queries.SearchFlights;

/// <summary>
/// Handler xử lý logic tìm kiếm chuyến bay thông qua việc gọi IDuffelService.
/// </summary>
public class SearchFlightsQueryHandler : IRequestHandler<SearchFlightsQuery, List<FlightOfferDto>>
{
    private readonly IDuffelService _duffelService;

    public SearchFlightsQueryHandler(IDuffelService duffelService)
    {
        _duffelService = duffelService;
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
            ReturnOffers = request.ReturnOffers
        };

        // Gửi yêu cầu qua Service trực tiếp tới Duffel Sandbox với chặng bay thật người dùng tìm kiếm
        var responseJson = await _duffelService.SearchOffersAsync(duffelRequest);
        // Thực hiện parse JSON từ Duffel và ánh xạ (map) sang List<FlightOfferDto> tối giản
        return ParseDuffelOffers(responseJson, request.Origin, request.Destination, request.DepartureDate);
    }

    /// <summary>
    /// Kiểm tra xem mã sân bay có phải thuộc Việt Nam hay không.
    /// </summary>
    private bool IsVietnameseAirport(string code)
    {
        if (string.IsNullOrEmpty(code)) return false;

        var vnAirports = new System.Collections.Generic.HashSet<string>(System.StringComparer.OrdinalIgnoreCase)
        {
            "HAN", "SGN", "DAD", "CXR", "PQC", "HPH", "VCA", "VII", "HUI", "UIH", "PXU", "TBB", "BMV", "VCL", "VCS", "VKG", "DIN", "SQH"
        };
        return vnAirports.Contains(code);
    }

    /// <summary>
    /// Hàm xử lý viết lại chuỗi JSON phản hồi của Duffel để giả lập các sân bay và hãng hàng không Việt Nam trong môi trường kiểm thử.
    /// </summary>
    private string RewriteJsonForVietnameseAirlinesAndAirports(string json, string targetOrigin, string targetDestination)
    {
        if (string.IsNullOrEmpty(json)) return json;

        // 1. Định nghĩa thông tin chi tiết các sân bay Việt Nam tiêu biểu để thay thế thông tin LHR và DXB
        var airportDetails = new System.Collections.Generic.Dictionary<string, (string Name, string City, string Icao, double Lat, double Lng)>(System.StringComparer.OrdinalIgnoreCase)
        {
            { "HAN", ("Noi Bai International Airport", "Hanoi", "VVNB", 21.2212, 105.8072) },
            { "SGN", ("Tan Son Nhat International Airport", "Ho Chi Minh City", "VVTS", 10.8186, 106.6554) },
            { "DAD", ("Da Nang International Airport", "Da Nang", "VVDN", 16.0569, 108.2005) },
            { "CXR", ("Cam Ranh International Airport", "Nha Trang", "VVCR", 11.9981, 109.2194) },
            { "PQC", ("Phu Quoc International Airport", "Phu Quoc", "VVPQ", 10.1691, 103.9904) }
        };

        var originInfo = airportDetails.ContainsKey(targetOrigin)
            ? airportDetails[targetOrigin]
            : ("Noi Bai International Airport", "Hanoi", "VVNB", 21.2212, 105.8072);

        var destInfo = airportDetails.ContainsKey(targetDestination)
            ? airportDetails[targetDestination]
            : ("Tan Son Nhat International Airport", "Ho Chi Minh City", "VVTS", 10.8186, 106.6554);

        // 2. Tiến hành thay thế các thuộc tính của LHR (London Heathrow) bằng targetOrigin
        json = json.Replace("\"iata_code\":\"LHR\"", $"\"iata_code\":\"{targetOrigin}\"");
        json = json.Replace("\"name\":\"Heathrow Airport\"", $"\"name\":\"{originInfo.Item1}\"");
        json = json.Replace("\"city_name\":\"London\"", $"\"city_name\":\"{originInfo.Item2}\"");
        json = json.Replace("\"icao_code\":\"EGLL\"", $"\"icao_code\":\"{originInfo.Item3}\"");
        json = json.Replace("\"id\":\"arp_lhr_gb\"", $"\"id\":\"arp_{targetOrigin.ToLower()}_vn\"");
        json = json.Replace("\"latitude\":51.470311", $"\"latitude\":{originInfo.Item4.ToString(System.Globalization.CultureInfo.InvariantCulture)}");
        json = json.Replace("\"longitude\":-0.458118", $"\"longitude\":{originInfo.Item5.ToString(System.Globalization.CultureInfo.InvariantCulture)}");

        // 3. Tiến hành thay thế các thuộc tính của DXB (Dubai) bằng targetDestination
        json = json.Replace("\"iata_code\":\"DXB\"", $"\"iata_code\":\"{targetDestination}\"");
        json = json.Replace("\"name\":\"Dubai International Airport\"", $"\"name\":\"{destInfo.Item1}\"");
        json = json.Replace("\"city_name\":\"Dubai\"", $"\"city_name\":\"{destInfo.Item2}\"");
        json = json.Replace("\"icao_code\":\"OMDB\"", $"\"icao_code\":\"{destInfo.Item3}\"");
        json = json.Replace("\"id\":\"arp_dxb_ae\"", $"\"id\":\"arp_{targetDestination.ToLower()}_vn\"");
        json = json.Replace("\"latitude\":25.252987", $"\"latitude\":{destInfo.Item4.ToString(System.Globalization.CultureInfo.InvariantCulture)}");
        json = json.Replace("\"longitude\":55.365035", $"\"longitude\":{destInfo.Item5.ToString(System.Globalization.CultureInfo.InvariantCulture)}");

        // 4. Ánh xạ các hãng hàng không quốc tế trong Sandbox thành hãng hàng không Việt Nam
        // a. Duffel Airways (ZZ) -> Vietnam Airlines (VN)
        json = json.Replace("\"iata_code\":\"ZZ\"", "\"iata_code\":\"VN\"");
        json = json.Replace("\"name\":\"Duffel Airways\"", "\"name\":\"Vietnam Airlines\"");
        json = json.Replace("\"logo_symbol_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/ZZ.svg\"",
                            "\"logo_symbol_url\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Vietnam_Airlines_2015_wordmark.svg/640px-Vietnam_Airlines_2015_wordmark.svg.png\"");

        // b. American Airlines (AA) -> VietJet Air (VJ)
        json = json.Replace("\"iata_code\":\"AA\"", "\"iata_code\":\"VJ\"");
        json = json.Replace("\"name\":\"American Airlines\"", "\"name\":\"VietJet Air\"");
        json = json.Replace("\"logo_symbol_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/AA.svg\"",
                            "\"logo_symbol_url\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/VietJet_Air_logo.svg/640px-VietJet_Air_logo.svg.png\"");
        json = json.Replace("\"logo_lockup_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/AA.svg\"", "\"logo_lockup_url\":null");

        // c. British Airways (BA) -> Bamboo Airways (QH)
        json = json.Replace("\"iata_code\":\"BA\"", "\"iata_code\":\"QH\"");
        json = json.Replace("\"name\":\"British Airways\"", "\"name\":\"Bamboo Airways\"");
        json = json.Replace("\"logo_symbol_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg\"",
                            "\"logo_symbol_url\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Bamboo_Airways_logo.svg/640px-Bamboo_Airways_logo.svg.png\"");
        json = json.Replace("\"logo_lockup_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg\"", "\"logo_lockup_url\":null");

        // d. Iberia (IB) -> Vietravel Airlines (VU)
        json = json.Replace("\"iata_code\":\"IB\"", "\"iata_code\":\"VU\"");
        json = json.Replace("\"name\":\"Iberia\"", "\"name\":\"Vietravel Airlines\"");
        json = json.Replace("\"logo_symbol_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/IB.svg\"",
                            "\"logo_symbol_url\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Vietravel_Airlines_logo.svg/640px-Vietravel_Airlines_logo.svg.png\"");
        json = json.Replace("\"logo_lockup_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/IB.svg\"", "\"logo_lockup_url\":null");

        return json;
    }

    /// <summary>
    /// Phân tích cú pháp chuỗi phản hồi JSON từ Duffel và ánh xạ (map) sang danh sách FlightOfferDto tinh gọn.
    /// Không áp dụng bất kỳ ánh xạ ảo hóa nào, sử dụng trực tiếp dữ liệu từ Duffel Sandbox API.
    /// Đồng thời tìm kiếm và gắn kèm thông tin Offer của hãng Duffel Airways (ZZ) để hỗ trợ Đặt vé sandbox.
    /// </summary>
    private List<FlightOfferDto> ParseDuffelOffers(string responseJson, string origin, string destination, string departureDateStr)
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
