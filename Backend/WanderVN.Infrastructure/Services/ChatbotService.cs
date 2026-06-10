using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Repositories;

namespace WanderVN.Infrastructure.Services;

public class ChatbotService : IChatbotService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChatbotService> _logger;
    private readonly IChatLogsRepository _chatLogsRepository;
    private readonly ISearchRepository _searchRepository;

    private const string GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    private const string GEMINI_MODEL = "gemini-2.5-flash";
    private const int HISTORY_TURN_LIMIT = 10;
    private const int MIN_REQUEST_INTERVAL_MS = 1000;
    private const int MAX_RETRIES = 3;

    private static readonly SemaphoreSlim _rateLimiter = new SemaphoreSlim(1, 1);
    private static DateTime _lastRequestTime = DateTime.MinValue;

    public ChatbotService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ChatbotService> logger,
        IChatLogsRepository chatLogsRepository,
        IHotelsRepository hotelsRepository,
        ISearchRepository searchRepository)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _chatLogsRepository = chatLogsRepository;
        _searchRepository = searchRepository;
    }

    public async Task<ChatbotResponse> ProcessUserMessage(ChatbotRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing chatbot message from user: {UserId}", request.UserId);

            await _chatLogsRepository.SaveChatLog(request.UserId, request.Message, false, cancellationToken);

            var history = await LoadConversationHistory(request.UserId, cancellationToken);

            // Kiểm tra intent tìm chuyến bay từ hội thoại
            var isFlight = IsFlightRequest(request.Message, history);

            HotelSearchContext hotelContext = new();
            if (!isFlight)
            {
                // Trích xuất intent tìm khách sạn từ toàn bộ nội dung hội thoại
                var intent = ParseHotelSearchIntent(request.Message, history);
                _logger.LogInformation("Parsed hotel intent: Location={Location}, CheckIn={CheckIn}, CheckOut={CheckOut}, Guests={Guests}",
                    intent.Location, intent.CheckIn, intent.CheckOut, intent.Guests);

                hotelContext = await BuildHotelContextFromDb(request, intent, cancellationToken);
            }

            var systemPrompt = BuildSystemPrompt(hotelContext, isFlight);
            var aiResponse = await CallGeminiApi(request.Message, history, systemPrompt, cancellationToken);

            if (string.IsNullOrEmpty(aiResponse))
            {
                _logger.LogWarning("Empty response from Gemini API");
                return new ChatbotResponse { Reply = "Xin lỗi, tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại." };
            }

            await _chatLogsRepository.SaveChatLog(request.UserId, aiResponse, true, cancellationToken);

            var hotelSuggestions = (!isFlight && hotelContext.Hotels.Count > 0)
                ? MapToHotelSuggestions(hotelContext.Hotels)
                : null;

            var flightUrl = ExtractFlightSearchUrl(request.Message, history, aiResponse);

            return new ChatbotResponse
            {
                Reply = aiResponse,
                Timestamp = DateTime.UtcNow,
                HotelSuggestions = hotelSuggestions,
                FlightSearchUrl = flightUrl
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chatbot message");
            return new ChatbotResponse
            {
                Reply = "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau."
            };
        }
    }

    public async Task<List<HotelSuggestion>> SearchHotels(string location, DateTime checkIn, DateTime checkOut, int guests, CancellationToken cancellationToken)
    {
        try
        {
            var hotels = await _searchRepository.SearchHotels(location, checkIn, checkOut, guests, cancellationToken);
            return MapToHotelSuggestions(hotels);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching hotels");
            return new List<HotelSuggestion>();
        }
    }

    // Tải lịch sử hội thoại gần nhất từ DB, sắp xếp theo thứ tự thời gian
    private async Task<List<ConversationTurn>> LoadConversationHistory(int? userId, CancellationToken cancellationToken)
    {
        if (userId == null)
            return new List<ConversationTurn>();

        var rawHistory = await _chatLogsRepository.GetUserChatHistory(userId.Value, HISTORY_TURN_LIMIT * 2, cancellationToken);

        return rawHistory
            .OrderBy(c => c.SentAt)
            .Select(c => new ConversationTurn
            {
                Role = c.IsFromBot == true ? "model" : "user",
                Text = c.MessageText ?? string.Empty
            })
            .ToList();
    }

    // Trích xuất intent tìm khách sạn từ free-text message và lịch sử hội thoại
    private static HotelSearchIntent ParseHotelSearchIntent(string message, List<ConversationTurn> history)
    {
        // Gộp toàn bộ lịch sử user (không lấy bot) + tin nhắn hiện tại để parse
        var allUserText = string.Join(" ", history
            .Where(h => h.Role == "user")
            .Select(h => h.Text)) + " " + message;

        var intent = new HotelSearchIntent
        {
            Location = ExtractLocation(allUserText),
            Guests   = ExtractGuestCount(allUserText)
        };

        (intent.CheckIn, intent.CheckOut) = ExtractDateRange(allUserText);

        return intent;
    }

    // Tìm kiếm khách sạn từ DB, ưu tiên dùng intent đã parse, fallback về chỉ location
    private async Task<HotelSearchContext> BuildHotelContextFromDb(
        ChatbotRequest request,
        HotelSearchIntent intent,
        CancellationToken cancellationToken)
    {
        var context = new HotelSearchContext();

        // Ưu tiên location từ request (structured) trước, nếu không có thì dùng từ parsed intent
        var location = !string.IsNullOrEmpty(request.Location) ? request.Location : intent.Location;
        if (string.IsNullOrEmpty(location))
            return context;

        var guests = request.Guests ?? intent.Guests;
        var checkIn = request.CheckInDate ?? intent.CheckIn;
        var checkOut = request.CheckOutDate ?? intent.CheckOut;

        try
        {
            if (checkIn.HasValue && checkOut.HasValue)
            {
                context.Hotels = await _searchRepository.SearchHotels(
                    location, checkIn.Value, checkOut.Value, guests, cancellationToken);
            }
            else
            {
                // Không có ngày → tìm theo location only
                context.Hotels = await _searchRepository.SearchHotelsByLocation(
                    location, guests, take: 8, cancellationToken);
            }

            context.SearchLocation = location;
            context.CheckIn = checkIn;
            context.CheckOut = checkOut;
            context.Guests = guests;

            _logger.LogInformation("Hotel search returned {Count} hotels for '{Location}'", context.Hotels.Count, location);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not search hotels from DB for chatbot context");
        }

        return context;
    }

    private string BuildSystemPrompt(HotelSearchContext hotelContext, bool isFlight)
    {
        var sb = new StringBuilder();

        sb.AppendLine("Bạn là trợ lý du lịch AI của ứng dụng WanderVN.");
        sb.AppendLine();
        sb.AppendLine("Trách nhiệm:");
        sb.AppendLine("1. Giúp khách hàng tìm và đặt phòng khách sạn tại Việt Nam");
        sb.AppendLine("2. Trả lời câu hỏi về tiện nghi, giá cả, địa điểm");
        sb.AppendLine("3. Tư vấn lịch trình du lịch");
        sb.AppendLine("4. Hỗ trợ tìm kiếm chuyến bay");
        sb.AppendLine();
        sb.AppendLine("Hướng dẫn quan trọng:");
        sb.AppendLine("- Luôn trả lời bằng tiếng Việt");
        sb.AppendLine("- Giữ câu trả lời ngắn gọn (dưới 200 từ), thân thiện và chuyên nghiệp");
        sb.AppendLine("- Nếu đã có DỮ LIỆU THỰC TẾ bên dưới, hãy dùng ngay dữ liệu đó để trả lời — KHÔNG hỏi lại thông tin đã biết");
        sb.AppendLine("- Chỉ hỏi thêm khi thực sự thiếu thông tin (ví dụ: chưa biết địa điểm)");
        sb.AppendLine("- Không bịa ra giá phòng nếu không có dữ liệu thực tế");

        if (isFlight)
        {
            sb.AppendLine();
            sb.AppendLine("=== HƯỚNG DẪN TÌM CHUYẾN BAY ===");
            sb.AppendLine("- Khách hàng đang muốn tìm kiếm hoặc đặt vé máy bay.");
            sb.AppendLine("- Hãy trả lời thân thiện, hỗ trợ khách hàng xác định các thông tin: điểm đi, điểm đến, ngày đi, ngày về (nếu khứ hồi), số lượng khách.");
            sb.AppendLine("- Nếu khách hàng chưa cung cấp ngày đi/ngày về hoặc điểm đi/điểm đến, hãy nhẹ nhàng hỏi họ.");
            sb.AppendLine("- Hệ thống sẽ tự động tạo một nút bấm 'Tìm chuyến bay ngay' phía dưới câu trả lời của bạn chứa link tìm kiếm chuyến bay khi đã trích xuất được điểm đi và điểm đến từ cuộc hội thoại.");
        }
        else if (hotelContext.Hotels.Count > 0)
        {
            sb.AppendLine();

            var dateInfo = hotelContext.CheckIn.HasValue && hotelContext.CheckOut.HasValue
                ? $"{hotelContext.CheckIn:dd/MM/yyyy} → {hotelContext.CheckOut:dd/MM/yyyy}, "
                : string.Empty;

            sb.AppendLine($"=== DỮ LIỆU THỰC TẾ: {hotelContext.Hotels.Count} khách sạn tìm được tại '{hotelContext.SearchLocation}' " +
                          $"({dateInfo}{hotelContext.Guests} khách) ===");

            foreach (var hotel in hotelContext.Hotels.Take(5))
            {
                var stars = hotel.StarRating.HasValue ? new string('★', hotel.StarRating.Value) : "Chưa xếp hạng";
                var minPrice = hotel.RoomTypes.OrderBy(rt => rt.BasePrice).FirstOrDefault()?.BasePrice;
                var priceText = minPrice.HasValue ? $"{minPrice:N0} VNĐ/đêm" : "Liên hệ";
                var address = hotel.Address ?? hotel.Location?.Name ?? "N/A";

                sb.AppendLine($"- **{hotel.Name}** ({stars}): {address} | Giá từ {priceText}");
            }

            sb.AppendLine();
            sb.AppendLine("Hãy giới thiệu CÁC KHÁCH SẠN TRÊN ngay trong câu trả lời này. Đây là dữ liệu thật từ hệ thống.");
        }
        else if (!string.IsNullOrEmpty(hotelContext.SearchLocation))
        {
            sb.AppendLine();
            sb.AppendLine($"Hệ thống không tìm thấy khách sạn phù hợp tại '{hotelContext.SearchLocation}'. Hãy thông báo điều này cho khách hàng và gợi ý họ thử địa điểm khác hoặc điều chỉnh tiêu chí.");
        }

        return sb.ToString();
    }

    private async Task<string?> CallGeminiApi(
        string userMessage,
        List<ConversationTurn> history,
        string systemPrompt,
        CancellationToken cancellationToken)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("Gemini API key is not configured");
            throw new InvalidOperationException("Gemini API key is not configured");
        }

        var requestUrl = $"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={apiKey}";

        // Xây dựng danh sách contents theo định dạng multi-turn của Gemini
        var contents = new List<GeminiContent>();

        foreach (var turn in history)
        {
            contents.Add(new GeminiContent
            {
                Role = turn.Role,
                Parts = new List<GeminiPart> { new() { Text = turn.Text } }
            });
        }

        contents.Add(new GeminiContent
        {
            Role = "user",
            Parts = new List<GeminiPart> { new() { Text = userMessage } }
        });

        var geminiRequest = new GeminiApiRequest
        {
            SystemInstruction = new GeminiSystemInstruction
            {
                Parts = new List<GeminiPart> { new() { Text = systemPrompt } }
            },
            Contents = contents
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var requestBody = JsonSerializer.Serialize(geminiRequest, options);

        for (int attempt = 0; attempt < MAX_RETRIES; attempt++)
        {
            try
            {
                await ApplyRateLimiting();

                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(requestUrl, content, cancellationToken);

                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    if (attempt < MAX_RETRIES - 1)
                    {
                        int delayMs = 2000 * (int)Math.Pow(2, attempt);
                        _logger.LogWarning("Rate limited (429). Retrying in {DelayMs}ms", delayMs);
                        await Task.Delay(delayMs, cancellationToken);
                        continue;
                    }
                    return null;
                }

                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("Gemini API error {Status}: {Body}", (int)response.StatusCode, body);

                    if ((int)response.StatusCode >= 500 && attempt < MAX_RETRIES - 1)
                    {
                        int delayMs = 2000 * (int)Math.Pow(2, attempt);
                        await Task.Delay(delayMs, cancellationToken);
                        continue;
                    }
                    return null;
                }

                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                var geminiResponse = JsonSerializer.Deserialize<GeminiApiResponse>(responseBody, options);

                if (geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text is string reply)
                {
                    _logger.LogInformation("Gemini API responded successfully");
                    return reply;
                }

                _logger.LogWarning("Unexpected Gemini response format: {Body}", responseBody);
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error on attempt {Attempt}", attempt + 1);

                if (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests && attempt < MAX_RETRIES - 1)
                {
                    int delayMs = 2000 * (int)Math.Pow(2, attempt);
                    await Task.Delay(delayMs, cancellationToken);
                    continue;
                }

                if (attempt == MAX_RETRIES - 1) return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error calling Gemini API on attempt {Attempt}", attempt + 1);
                return null;
            }
        }

        return null;
    }

    private async Task ApplyRateLimiting()
    {
        await _rateLimiter.WaitAsync();
        try
        {
            var timeSince = DateTime.UtcNow - _lastRequestTime;
            if (timeSince.TotalMilliseconds < MIN_REQUEST_INTERVAL_MS)
            {
                var delay = (int)(MIN_REQUEST_INTERVAL_MS - timeSince.TotalMilliseconds);
                if (delay > 0)
                    await Task.Delay(delay);
            }
            _lastRequestTime = DateTime.UtcNow;
        }
        finally
        {
            _rateLimiter.Release();
        }
    }

    private static List<HotelSuggestion> MapToHotelSuggestions(IEnumerable<WanderVN.Domain.Entities.Hotels> hotels)
    {
        return hotels.Select(h => new HotelSuggestion
        {
            HotelId = h.Id,
            Name = h.Name,
            Address = h.Address,
            StarRating = h.StarRating,
            Price = h.RoomTypes.FirstOrDefault()?.BasePrice
        }).ToList();
    }

    // Kiểm tra xem người dùng có đang yêu cầu tìm/đặt vé máy bay hay không
    private static bool IsFlightRequest(string userMessage, List<ConversationTurn> history)
    {
        var combinedText = (string.Join(" ", history
            .Where(h => h.Role == "user")
            .Select(h => h.Text)) + " " + userMessage).ToLower();

        return combinedText.Contains("vé máy bay") ||
               combinedText.Contains("chuyến bay") ||
               combinedText.Contains("bay từ") ||
               combinedText.Contains("bay đến") ||
               combinedText.Contains("bay đi") ||
               combinedText.Contains("vé bay") ||
               combinedText.Contains("đặt vé máy bay") ||
               combinedText.Contains("đặt chuyến bay") ||
               combinedText.Contains("máy bay") ||
               combinedText.Contains("flight");
    }

    // Phân tích tin nhắn và phản hồi để tạo URL tìm kiếm chuyến bay nếu user hỏi về vé máy bay
    private static string? ExtractFlightSearchUrl(string userMessage, List<ConversationTurn> history, string aiResponse)
    {
        var combinedUserText = string.Join(" ", history
            .Where(h => h.Role == "user")
            .Select(h => h.Text)) + " " + userMessage;

        var combinedAll = (combinedUserText + " " + aiResponse).ToLower();

        bool isFlightIntent = combinedAll.Contains("vé máy bay") ||
                              combinedAll.Contains("chuyến bay") ||
                              combinedAll.Contains("bay từ") ||
                              combinedAll.Contains("bay đến") ||
                              combinedAll.Contains("bay đi") ||
                              combinedAll.Contains("vé bay") ||
                              combinedAll.Contains("đặt vé máy bay") ||
                              combinedAll.Contains("đặt chuyến bay") ||
                              combinedAll.Contains("máy bay") ||
                              combinedAll.Contains("flight");

        if (!isFlightIntent)
            return null;

        string? origin = null;
        string? destination = null;

        // Trích xuất mã sân bay IATA (3 ký tự viết hoa) nếu có trong tin nhắn gốc của user hoặc lịch sử
        var iataCodes = Regex.Matches(combinedUserText, @"\b([A-Z]{3})\b")
            .Cast<Match>()
            .Select(m => m.Value)
            .ToList();

        if (iataCodes.Count >= 2)
        {
            origin = iataCodes[0];
            destination = iataCodes[1];
        }
        else
        {
            // Trích xuất từ tên các thành phố
            origin = ExtractAirportCode(combinedUserText, isOrigin: true);
            destination = ExtractAirportCode(combinedUserText, isOrigin: false);
        }

        // Nếu điểm đi giống điểm đến thì reset điểm đến để người dùng tự chọn
        if (origin != null && origin == destination)
        {
            destination = null;
        }

        var (departureDate, returnDate) = ExtractFlightDateRange(combinedUserText);

        if (origin == null && destination == null)
            return null;

        string cabinClass = "economy";
        if (combinedUserText.ToLower().Contains("thương gia") || 
            combinedUserText.ToLower().Contains("business") || 
            combinedUserText.ToLower().Contains("first class") || 
            combinedUserText.ToLower().Contains("vip"))
        {
            cabinClass = "business";
        }

        string tripType = "one-way";
        if (combinedUserText.ToLower().Contains("khứ hồi") || 
            combinedUserText.ToLower().Contains("khu hoi") || 
            combinedUserText.ToLower().Contains("hai chiều") || 
            combinedUserText.ToLower().Contains("round-trip") || 
            combinedUserText.ToLower().Contains("roundtrip") || 
            returnDate != null)
        {
            tripType = "round-trip";
        }

        var (adults, children, infants) = ExtractPassengers(combinedUserText);

        var queryParams = new List<string>();
        if (origin != null) queryParams.Add($"origin={origin}");
        if (destination != null) queryParams.Add($"destination={destination}");
        if (departureDate != null) queryParams.Add($"departureDate={departureDate}");
        queryParams.Add($"tripType={tripType}");
        queryParams.Add($"cabinClass={cabinClass}");
        queryParams.Add($"_t={DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}");
        if (tripType == "round-trip" && returnDate != null)
        {
            queryParams.Add($"returnDate={returnDate}");
        }
        queryParams.Add($"adults={adults}");
        queryParams.Add($"children={children}");
        queryParams.Add($"infants={infants}");

        return $"http://localhost:5173/flights?{string.Join("&", queryParams)}";
    }

    // Trích xuất ngày đi và ngày về (nếu có)
    private static (string? departureDate, string? returnDate) ExtractFlightDateRange(string text)
    {
        var dates = new List<DateTime>();
        var currentYear = DateTime.Now.Year;

        // Định dạng dd/MM hoặc dd/M
        var shortDateMatches = Regex.Matches(text, @"\b(\d{1,2})/(\d{1,2})\b");
        foreach (Match m in shortDateMatches)
        {
            if (int.TryParse(m.Groups[1].Value, out int day) &&
                int.TryParse(m.Groups[2].Value, out int month))
            {
                try
                {
                    var dt = new DateTime(currentYear, month, day);
                    if (dt < DateTime.Today) dt = dt.AddYears(1);
                    dates.Add(dt);
                }
                catch { }
            }
        }

        // Định dạng dd/MM/yyyy
        var fullDateMatches = Regex.Matches(text, @"\b(\d{1,2})/(\d{1,2})/(\d{4})\b");
        foreach (Match m in fullDateMatches)
        {
            if (DateTime.TryParseExact(m.Value, new[] { "d/M/yyyy", "dd/MM/yyyy" },
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var dt))
            {
                dates.RemoveAll(d => d.Day == dt.Day && d.Month == dt.Month);
                dates.Add(dt);
            }
        }

        // Định dạng ISO yyyy-MM-dd
        var isoMatches = Regex.Matches(text, @"\b(\d{4})-(\d{2})-(\d{2})\b");
        foreach (Match m in isoMatches)
        {
            if (DateTime.TryParse(m.Value, out var dt))
                dates.Add(dt);
        }

        dates = dates.Distinct().OrderBy(d => d).ToList();

        string? dep = null;
        string? ret = null;

        if (dates.Count >= 2)
        {
            dep = dates[0].ToString("yyyy-MM-dd");
            ret = dates[1].ToString("yyyy-MM-dd");
        }
        else if (dates.Count == 1)
        {
            dep = dates[0].ToString("yyyy-MM-dd");
        }

        return (dep, ret);
    }

    // Trích xuất số lượng hành khách (người lớn, trẻ em, em bé)
    private static (int adults, int children, int infants) ExtractPassengers(string text)
    {
        int adults = 1;
        int children = 0;
        int infants = 0;

        var infantMatch = Regex.Match(text, @"(\d+)\s*(?:em bé|sơ sinh|infants?|inf)", RegexOptions.IgnoreCase);
        if (infantMatch.Success && int.TryParse(infantMatch.Groups[1].Value, out int infCount))
        {
            infants = infCount;
        }

        var childMatch = Regex.Match(text, @"(\d+)\s*(?:trẻ em|trẻ nhỏ|children|child|bé|kids?)", RegexOptions.IgnoreCase);
        if (childMatch.Success && int.TryParse(childMatch.Groups[1].Value, out int childCount))
        {
            if (!text.Contains("em bé") || childMatch.Value.Contains("trẻ") || childMatch.Value.Contains("child") || childMatch.Value.Contains("kid"))
            {
                children = childCount;
            }
        }

        var adultMatch = Regex.Match(text, @"(\d+)\s*(?:người lớn|người|khách|adults?|pax)", RegexOptions.IgnoreCase);
        if (adultMatch.Success && int.TryParse(adultMatch.Groups[1].Value, out int adultCount))
        {
            adults = adultCount;
        }

        return (adults, children, infants);
    }

    // Trích xuất mã sân bay IATA dựa trên tên thành phố
    private static string? ExtractAirportCode(string text, bool isOrigin)
    {
        var cityToIata = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "hà nội", "HAN" }, { "ha noi", "HAN" }, { "nội bài", "HAN" }, { "han", "HAN" },
            { "hồ chí minh", "SGN" }, { "ho chi minh", "SGN" }, { "sài gòn", "SGN" }, { "saigon", "SGN" }, { "tân sơn nhất", "SGN" }, { "sgn", "SGN" },
            { "đà nẵng", "DAD" }, { "da nang", "DAD" }, { "dad", "DAD" },
            { "phú quốc", "PQC" }, { "phu quoc", "PQC" }, { "pqc", "PQC" },
            { "nha trang", "CXR" }, { "cxr", "CXR" },
            { "huế", "HUI" }, { "hue", "HUI" }, { "hui", "HUI" },
            { "đà lạt", "DLI" }, { "da lat", "DLI" }, { "dli", "DLI" },
            { "cần thơ", "VCA" }, { "can tho", "VCA" }, { "vca", "VCA" },
            { "hải phòng", "HPH" }, { "hai phong", "HPH" }, { "hph", "HPH" },
            { "buôn ma thuột", "BMV" }, { "buon ma thuot", "BMV" }, { "bmv", "BMV" },
            { "pleiku", "PXU" }, { "pxu", "PXU" },
            { "quy nhơn", "UIH" }, { "quy nhon", "UIH" }, { "uih", "UIH" },
            { "vinh", "VII" }, { "vii", "VII" },
            { "thanh hóa", "THD" }, { "thanh hoa", "THD" }, { "thd", "THD" },
        };

        var lowerText = text.ToLower();

        if (isOrigin)
        {
            foreach (var entry in cityToIata)
            {
                var pattern = $@"(?:^|\s)(?:từ|from|đi từ)\s+{Regex.Escape(entry.Key)}(?:$|\s|[.,!?])";
                if (Regex.IsMatch(lowerText, pattern))
                    return entry.Value;
            }
        }
        else
        {
            foreach (var entry in cityToIata)
            {
                var pattern = $@"(?:^|\s)(?:đến|tới|to|đi|bay đến|bay tới|về)\s+{Regex.Escape(entry.Key)}(?:$|\s|[.,!?])";
                if (Regex.IsMatch(lowerText, pattern))
                    return entry.Value;
            }
        }

        var matches = new List<(string code, int index)>();
        foreach (var entry in cityToIata)
        {
            var searchKey = entry.Key;
            var index = -1;
            if (searchKey.Length == 3)
            {
                var pattern = $@"(?:^|\s){Regex.Escape(searchKey)}(?:$|\s|[.,!?])";
                var match = Regex.Match(lowerText, pattern);
                if (match.Success)
                {
                    index = match.Index;
                }
            }
            else
            {
                index = lowerText.IndexOf(searchKey);
            }

            if (index >= 0)
            {
                matches.Add((entry.Value, index));
            }
        }

        if (matches.Count > 0)
        {
            var sorted = matches.OrderBy(m => m.index).ToList();
            if (isOrigin)
            {
                return sorted[0].code;
            }
            else
            {
                if (sorted.Count >= 2)
                    return sorted.Last().code;
            }
        }

        return null;
    }

    private sealed record ConversationTurn
    {
        public string Role { get; init; } = "user";
        public string Text { get; init; } = string.Empty;
    }

    private sealed class HotelSearchIntent
    {
        public string? Location { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public int Guests { get; set; } = 1;
    }

    private sealed class HotelSearchContext
    {
        public List<WanderVN.Domain.Entities.Hotels> Hotels { get; set; } = new();
        public string? SearchLocation { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public int Guests { get; set; }
    }

    // Bảng ánh xạ tên thành phố/tỉnh phổ biến ở Việt Nam sang từ khóa tìm kiếm trong DB
    private static readonly Dictionary<string, string> CitySearchKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        { "hà nội", "Hà Nội" }, { "ha noi", "Hà Nội" }, { "hanoi", "Hà Nội" },
        { "hồ chí minh", "Hồ Chí Minh" }, { "ho chi minh", "Hồ Chí Minh" }, { "sài gòn", "Hồ Chí Minh" }, { "saigon", "Hồ Chí Minh" }, { "hcm", "Hồ Chí Minh" },
        { "đà nẵng", "Đà Nẵng" }, { "da nang", "Đà Nẵng" }, { "danang", "Đà Nẵng" },
        { "đà lạt", "Đà Lạt" }, { "da lat", "Đà Lạt" }, { "dalat", "Đà Lạt" },
        { "phú quốc", "Phú Quốc" }, { "phu quoc", "Phú Quốc" }, { "phuquoc", "Phú Quốc" },
        { "nha trang", "Nha Trang" }, { "nhatrang", "Nha Trang" },
        { "huế", "Huế" }, { "hue", "Huế" },
        { "hội an", "Hội An" }, { "hoi an", "Hội An" }, { "hoian", "Hội An" },
        { "cần thơ", "Cần Thơ" }, { "can tho", "Cần Thơ" },
        { "hải phòng", "Hải Phòng" }, { "hai phong", "Hải Phòng" },
        { "vũng tàu", "Vũng Tàu" }, { "vung tau", "Vũng Tàu" }, { "vungtau", "Vũng Tàu" },
        { "quy nhơn", "Quy Nhơn" }, { "quy nhon", "Quy Nhơn" },
        { "phan thiết", "Phan Thiết" }, { "phan thiet", "Phan Thiết" },
        { "mũi né", "Mũi Né" }, { "mui ne", "Mũi Né" },
        { "sa pa", "Sa Pa" }, { "sapa", "Sa Pa" },
        { "hạ long", "Hạ Long" }, { "ha long", "Hạ Long" }, { "halong", "Hạ Long" },
        { "ninh bình", "Ninh Bình" }, { "ninh binh", "Ninh Bình" },
        { "buôn ma thuột", "Buôn Ma Thuột" }, { "buon ma thuot", "Buôn Ma Thuột" },
    };

    private static string? ExtractLocation(string text)
    {
        var lowerText = text.ToLower();

        // Tìm theo pattern "ở/tại/đến/tới [thành phố]" trước (độ chính xác cao)
        foreach (var entry in CitySearchKeywords)
        {
            var pattern = $@"(?:ở|tại|đến|tới|tại|cho|ở)\s+{Regex.Escape(entry.Key)}";
            if (Regex.IsMatch(lowerText, pattern))
                return entry.Value;
        }

        // Fallback: tìm tên thành phố xuất hiện bất kỳ trong text
        foreach (var entry in CitySearchKeywords)
        {
            if (lowerText.Contains(entry.Key))
                return entry.Value;
        }

        return null;
    }

    private static (DateTime? checkIn, DateTime? checkOut) ExtractDateRange(string text)
    {
        var dates = new List<DateTime>();
        var currentYear = DateTime.Now.Year;

        // Pattern "dd/MM" hoặc "dd/M" — năm lấy từ hiện tại hoặc năm sau nếu đã qua
        var shortDateMatches = Regex.Matches(text, @"\b(\d{1,2})/(\d{1,2})\b");
        foreach (Match m in shortDateMatches)
        {
            if (int.TryParse(m.Groups[1].Value, out int day) &&
                int.TryParse(m.Groups[2].Value, out int month))
            {
                try
                {
                    var dt = new DateTime(currentYear, month, day);
                    if (dt < DateTime.Today) dt = dt.AddYears(1);
                    dates.Add(dt);
                }
                catch { /* ngày không hợp lệ */ }
            }
        }

        // Pattern "dd/MM/yyyy"
        var fullDateMatches = Regex.Matches(text, @"\b(\d{1,2})/(\d{1,2})/(\d{4})\b");
        foreach (Match m in fullDateMatches)
        {
            if (DateTime.TryParseExact(m.Value, new[] { "d/M/yyyy", "dd/MM/yyyy" },
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var dt))
            {
                // Nếu ngày này chưa có trong danh sách từ short pattern thì thêm vào
                dates.RemoveAll(d => d.Day == dt.Day && d.Month == dt.Month);
                dates.Add(dt);
            }
        }

        // Pattern ISO "yyyy-MM-dd"
        var isoMatches = Regex.Matches(text, @"\b(\d{4})-(\d{2})-(\d{2})\b");
        foreach (Match m in isoMatches)
        {
            if (DateTime.TryParse(m.Value, out var dt))
                dates.Add(dt);
        }

        dates = dates.Distinct().OrderBy(d => d).ToList();

        if (dates.Count >= 2)
            return (dates[0], dates[1]);
        if (dates.Count == 1)
            return (dates[0], null);

        return (null, null);
    }

    private static int ExtractGuestCount(string text)
    {
        // Pattern "2 người", "3 khách", "2 người lớn", "cho 4 người"
        var match = Regex.Match(text, @"(\d+)\s*(?:người|khách|adults?|pax|người lớn)",
            RegexOptions.IgnoreCase);
        if (match.Success && int.TryParse(match.Groups[1].Value, out int count) && count is >= 1 and <= 20)
            return count;

        return 1;
    }
}

// DTO nội bộ cho Gemini API (tách biệt khỏi GeminiDto trong Application layer)
internal sealed class GeminiApiRequest
{
    [System.Text.Json.Serialization.JsonPropertyName("systemInstruction")]
    public GeminiSystemInstruction? SystemInstruction { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("contents")]
    public List<GeminiContent> Contents { get; set; } = new();
}

internal sealed class GeminiSystemInstruction
{
    [System.Text.Json.Serialization.JsonPropertyName("parts")]
    public List<GeminiPart> Parts { get; set; } = new();
}

internal sealed class GeminiContent
{
    [System.Text.Json.Serialization.JsonPropertyName("role")]
    public string Role { get; set; } = "user";

    [System.Text.Json.Serialization.JsonPropertyName("parts")]
    public List<GeminiPart> Parts { get; set; } = new();
}

internal sealed class GeminiPart
{
    [System.Text.Json.Serialization.JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}

internal sealed class GeminiApiResponse
{
    [System.Text.Json.Serialization.JsonPropertyName("candidates")]
    public List<GeminiCandidate>? Candidates { get; set; }
}

internal sealed class GeminiCandidate
{
    [System.Text.Json.Serialization.JsonPropertyName("content")]
    public GeminiContent? Content { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("finishReason")]
    public string? FinishReason { get; set; }
}
