namespace WanderVN.Application.DTOs.Request;

public class ChatbotRequest
{
    public int? UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public int? ConversationId { get; set; }
    public DateTime? CheckInDate { get; set; }
    public DateTime? CheckOutDate { get; set; }
    public string? Location { get; set; }
    public int? Guests { get; set; }
}
