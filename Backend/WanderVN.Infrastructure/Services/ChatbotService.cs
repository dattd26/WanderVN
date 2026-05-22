using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
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
    private readonly IHotelsRepository _hotelsRepository;
    private readonly ISearchRepository _searchRepository;

    // Update your endpoint constant to separate the base from the model identifier cleanly
private const string GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
private const string GEMINI_MODEL = "gemini-1.5-flash";
    
    // Rate limiting: max 60 requests per minute
    private static readonly SemaphoreSlim _rateLimiter = new SemaphoreSlim(1, 1);
    private static DateTime _lastRequestTime = DateTime.MinValue;
    private const int MIN_REQUEST_INTERVAL_MS = 1000; // 1 second between requests

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
        _hotelsRepository = hotelsRepository;
        _searchRepository = searchRepository;
    }

    public async Task<ChatbotResponse> ProcessUserMessage(ChatbotRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing chatbot message from user: {UserId}", request.UserId);

            // Save user message to chat logs
            await _chatLogsRepository.SaveChatLog(request.UserId, request.Message, false, cancellationToken);

            // Build context for AI
            var context = BuildContext(request);
            var systemPrompt = BuildSystemPrompt();

            // Call Gemini API
            var aiResponse = await CallGeminiAPI(request.Message, context, systemPrompt, cancellationToken);

            if (string.IsNullOrEmpty(aiResponse))
            {
                _logger.LogWarning("Empty response from Gemini API");
                return new ChatbotResponse { Reply = "Xin lỗi, tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại." };
            }

            // Save AI response to chat logs
            await _chatLogsRepository.SaveChatLog(request.UserId, aiResponse, true, cancellationToken);

            // Extract hotel suggestions if applicable
            var suggestions = await ExtractAndSearchHotels(request, aiResponse, cancellationToken);

            return new ChatbotResponse
            {
                Reply = aiResponse,
                Timestamp = DateTime.UtcNow,
                HotelSuggestions = suggestions
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

            return hotels.Select(h => new HotelSuggestion
            {
                HotelId = h.Id,
                Name = h.Name,
                Address = h.Address,
                StarRating = h.StarRating,
                Price = h.RoomTypes?.FirstOrDefault()?.BasePrice
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching hotels");
            return new List<HotelSuggestion>();
        }
    }

    private string BuildSystemPrompt()
    {
        return @"Bạn là một trợ lý khách sạn AI thân thiện cho ứng dụng đặt phòng WanderVN.

Trách nhiệm của bạn:
1. Giúp khách hàng tìm và đặt phòng khách sạn
2. Trả lời các câu hỏi về tiện nghi, giá cả, địa điểm
3. Cung cấp các gợi ý cá nhân hóa dựa trên nhu cầu của họ
4. Xử lý các yêu cầu đặt phòng

Hướng dẫn:
- Luôn sử dụng tiếng Việt để trả lời
- Hỏi các câu hỏi làm rõ nếu cần (ngày check-in, check-out, số khách, địa điểm)
- Đừng đưa ra giá cả chính xác nếu không chắc chắn, hãy nói có thể khác
- Nếu khách hàng muốn tìm phòng, hãy trích xuất: check-in, check-out, số khách, địa điểm
- Giữ câu trả lời ngắn gọn, dưới 200 từ
- Thân thiện và chuyên nghiệp";
    }

    private string BuildContext(ChatbotRequest request)
    {
        var context = new StringBuilder();
        context.AppendLine("Thông tin người dùng:");

        if (request.CheckInDate.HasValue)
            context.AppendLine($"- Check-in: {request.CheckInDate:dd/MM/yyyy}");

        if (request.CheckOutDate.HasValue)
            context.AppendLine($"- Check-out: {request.CheckOutDate:dd/MM/yyyy}");

        if (request.Guests.HasValue)
            context.AppendLine($"- Số khách: {request.Guests}");

        if (!string.IsNullOrEmpty(request.Location))
            context.AppendLine($"- Địa điểm: {request.Location}");

        return context.ToString();
    }

    private async Task<string> CallGeminiAPI(string message, string context, string systemPrompt, CancellationToken cancellationToken)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("Gemini API key is not configured");
            throw new InvalidOperationException("Gemini API key is not configured");
        }

       // Change this line:
// var requestUrl = $"{GEMINI_API_ENDPOINT}?key={apiKey}";

// To this:
        var requestUrl = $"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={apiKey}";
        var fullMessage = $"{context}\n\nUser: {message}";

        var geminiRequest = new GeminiRequest
        {
            SystemInstruction = new SystemInstruction
            {
                Parts = new List<Part>
                {
                    new() { Text = systemPrompt }
                }
            },
            Contents = new List<Content>
            {
                new()
                {
                    Role = "user",
                    Parts = new List<Part>
                    {
                        new() { Text = fullMessage }
                    }
                }
            }
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var requestBody = JsonSerializer.Serialize(geminiRequest, options);
        var content = new StringContent(requestBody, Encoding.UTF8, "application/json");

        _logger.LogInformation("Calling Gemini API with message: {Message}", message);

        // Retry logic with exponential backoff for rate limiting
        const int maxRetries = 3;
        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                // Apply rate limiting
                await ApplyRateLimiting();

                var response = await _httpClient.PostAsync(requestUrl, content, cancellationToken);

                // Handle 429 (Too Many Requests) with retry
                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    if (attempt < maxRetries - 1)
                    {
                        // Exponential backoff: 2s, 4s, 8s
                        int delayMs = 2000 * (int)Math.Pow(2, attempt);
                        _logger.LogWarning("Rate limited (429). Retrying in {DelayMs}ms (attempt {Attempt}/{MaxRetries})", delayMs, attempt + 1, maxRetries);
                        await Task.Delay(delayMs, cancellationToken);
                        continue;
                    }
                    else
                    {
                        _logger.LogError("Rate limited after {MaxRetries} retries", maxRetries);
                        return null;
                    }
                }

                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseBody, options);

                if (geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text is string aiReply)
                {
                    return aiReply;
                }

                _logger.LogWarning("Invalid response from Gemini API");
                return null;
            }
            catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests && attempt < maxRetries - 1)
            {
                int delayMs = 2000 * (int)Math.Pow(2, attempt);
                _logger.LogWarning(ex, "HTTP 429 error. Retrying in {DelayMs}ms (attempt {Attempt}/{MaxRetries})", delayMs, attempt + 1, maxRetries);
                await Task.Delay(delayMs, cancellationToken);
                continue;
            }
        }

        return null;
    }

    private async Task ApplyRateLimiting()
    {
        await _rateLimiter.WaitAsync();
        try
        {
            var timeSinceLastRequest = DateTime.UtcNow - _lastRequestTime;
            if (timeSinceLastRequest.TotalMilliseconds < MIN_REQUEST_INTERVAL_MS)
            {
                var delayMs = (int)(MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest.TotalMilliseconds);
                if (delayMs > 0)
                {
                    _logger.LogDebug("Rate limiting: waiting {DelayMs}ms", delayMs);
                    await Task.Delay(delayMs);
                }
            }
            _lastRequestTime = DateTime.UtcNow;
        }
        finally
        {
            _rateLimiter.Release();
        }
    }

    private async Task<List<HotelSuggestion>?> ExtractAndSearchHotels(ChatbotRequest request, string aiResponse, CancellationToken cancellationToken)
    {
        // Check if AI response contains hotel search intent
        if (!aiResponse.ToLower().Contains("tìm") && !aiResponse.ToLower().Contains("phòng") && !aiResponse.ToLower().Contains("khách sạn"))
            return null;

        // If we have search parameters, search for hotels
        if (request.CheckInDate.HasValue && request.CheckOutDate.HasValue && !string.IsNullOrEmpty(request.Location))
        {
            var guests = request.Guests ?? 1;
            return await SearchHotels(request.Location, request.CheckInDate.Value, request.CheckOutDate.Value, guests, cancellationToken);
        }

        return null;
    }
}

// Local helper classes to avoid conflicts
public class GeminiRequest
{
    [JsonPropertyName("contents")]
    public List<Content> Contents { get; set; } = new();
    
    [JsonPropertyName("systemInstruction")]
    public SystemInstruction? SystemInstruction { get; set; }
}

public class Content
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = "user";
    
    [JsonPropertyName("parts")]
    public List<Part> Parts { get; set; } = new();
}

public class Part
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}

public class SystemInstruction
{
    [JsonPropertyName("parts")]
    public List<Part> Parts { get; set; } = new();
}
