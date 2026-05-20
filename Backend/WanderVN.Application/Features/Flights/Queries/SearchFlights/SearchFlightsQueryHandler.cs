using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;

namespace WanderVN.Application.Features.Flights.Queries.SearchFlights;

/// <summary>
/// Handler xử lý logic tìm kiếm chuyến bay thông qua việc gọi IDuffelService.
/// </summary>
public class SearchFlightsQueryHandler : IRequestHandler<SearchFlightsQuery, string>
{
    private readonly IDuffelService _duffelService;

    public SearchFlightsQueryHandler(IDuffelService duffelService)
    {
        _duffelService = duffelService;
    }

    public async Task<string> Handle(SearchFlightsQuery request, CancellationToken cancellationToken)
    {
        var originalOrigin = request.Origin;
        var originalDestination = request.Destination;

        // Bật chế độ ảo hóa Sandbox cho các tuyến bay không thuộc chặng bay thử nghiệm chính thức của Duffel.
        // Duffel Sandbox chỉ hỗ trợ chặng bay LHR -> DXB hoặc LTN -> STN ổn định 100%.
        var queryOrigin = originalOrigin;
        var queryDestination = originalDestination;
        bool isVirtualMapping = false;

        // Nếu điểm đi hoặc điểm đến là các sân bay Việt Nam, ta chuyển chặng bay sang LHR -> DXB để lấy data sandbox chuẩn
        if (IsVietnameseAirport(originalOrigin) || IsVietnameseAirport(originalDestination) || originalOrigin == "string")
        {
            queryOrigin = "LHR";
            queryDestination = "DXB";
            isVirtualMapping = true;
        }

        // Chuyển đổi Query thành DTO của service bao gồm cấu hình return_offers
        var duffelRequest = new DuffelOfferRequestDto
        {
            Origin = queryOrigin,
            Destination = queryDestination,
            DepartureDate = request.DepartureDate,
            PassengerType = request.PassengerType,
            ReturnOffers = request.ReturnOffers
        };

        // Gửi yêu cầu qua Service và trả về JSON gốc từ API đối tác
        var responseJson = await _duffelService.SearchOffersAsync(duffelRequest);

        // Nếu đang ở chế độ ảo hóa sandbox, viết lại JSON để giả lập các hãng hàng không và sân bay Việt Nam cực kỳ chân thực
        if (isVirtualMapping)
        {
            responseJson = RewriteJsonForVietnameseAirlinesAndAirports(responseJson, originalOrigin, originalDestination);
        }
        
        return responseJson;
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
        json = json.Replace("\"logo_lockup_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/AA.svg\"", "null");

        // c. British Airways (BA) -> Bamboo Airways (QH)
        json = json.Replace("\"iata_code\":\"BA\"", "\"iata_code\":\"QH\"");
        json = json.Replace("\"name\":\"British Airways\"", "\"name\":\"Bamboo Airways\"");
        json = json.Replace("\"logo_symbol_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg\"", 
                            "\"logo_symbol_url\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Bamboo_Airways_logo.svg/640px-Bamboo_Airways_logo.svg.png\"");
        json = json.Replace("\"logo_lockup_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg\"", "null");

        // d. Iberia (IB) -> Vietravel Airlines (VU)
        json = json.Replace("\"iata_code\":\"IB\"", "\"iata_code\":\"VU\"");
        json = json.Replace("\"name\":\"Iberia\"", "\"name\":\"Vietravel Airlines\"");
        json = json.Replace("\"logo_symbol_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/IB.svg\"", 
                            "\"logo_symbol_url\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Vietravel_Airlines_logo.svg/640px-Vietravel_Airlines_logo.svg.png\"");
        json = json.Replace("\"logo_lockup_url\":\"https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/IB.svg\"", "null");

        return json;
    }
}
