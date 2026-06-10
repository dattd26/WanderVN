using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WanderVN.API.Common.Responses;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;
using WanderVN.Domain.Repositories;

namespace WanderVN.API.Controllers;

[Route("api/v1/chatbot")]
[ApiController]
public class ChatbotController : ControllerBase
{
    private readonly IChatbotService _chatbotService;
    private readonly IChatLogsRepository _chatLogsRepository;
    private readonly ILogger<ChatbotController> _logger;

    public ChatbotController(
        IChatbotService chatbotService,
        IChatLogsRepository chatLogsRepository,
        ILogger<ChatbotController> logger)
    {
        _chatbotService = chatbotService;
        _chatLogsRepository = chatLogsRepository;
        _logger = logger;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] ChatbotRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new ErrorResponse("Message cannot be empty", 400));

        try
        {
            _logger.LogInformation("Received chatbot message: {Message} from user: {UserId}", request.Message, request.UserId);

            var response = await _chatbotService.ProcessUserMessage(request, CancellationToken.None);

            if (response == null)
                return StatusCode(500, new ErrorResponse("Failed to process message", 500));

            return Ok(new ApiResponse<ChatbotResponse>(true, "Message processed successfully", 200, response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chatbot message");
            return StatusCode(500, new ErrorResponse("Internal server error", 500));
        }
    }

    [HttpPost("search")]
    public async Task<IActionResult> SearchHotels([FromBody] ChatbotRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Location) || !request.CheckInDate.HasValue || !request.CheckOutDate.HasValue)
            return BadRequest(new ErrorResponse("Location, check-in date, and check-out date are required", 400));

        try
        {
            var guests = request.Guests ?? 1;
            var suggestions = await _chatbotService.SearchHotels(
                request.Location,
                request.CheckInDate.Value,
                request.CheckOutDate.Value,
                guests,
                CancellationToken.None);

            return Ok(new ApiResponse<List<HotelSuggestion>>(true, "Hotels found", 200, suggestions));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching hotels");
            return StatusCode(500, new ErrorResponse("Error searching hotels", 500));
        }
    }

    [HttpGet("history/{userId}")]
    public async Task<IActionResult> GetChatHistory([FromRoute] int userId, [FromQuery] int? limit = 50)
    {
        try
        {
            var history = await _chatLogsRepository.GetUserChatHistory(userId, limit, CancellationToken.None);

            return Ok(new ApiResponse<object>(true, "Chat history retrieved", 200, new
            {
                messages = history.Reverse().Select(h => new
                {
                    text = h.MessageText,
                    isFromBot = h.IsFromBot,
                    sentAt = h.SentAt
                }).ToList()
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat history");
            return StatusCode(500, new ErrorResponse("Error retrieving chat history", 500));
        }
    }
}
