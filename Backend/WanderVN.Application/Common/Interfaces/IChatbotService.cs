using WanderVN.Application.DTOs.Request;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Common.Interfaces;

public interface IChatbotService
{
    Task<ChatbotResponse> ProcessUserMessage(ChatbotRequest request, CancellationToken cancellationToken);
    Task<List<HotelSuggestion>> SearchHotels(string location, DateTime checkIn, DateTime checkOut, int guests, CancellationToken cancellationToken);
}
