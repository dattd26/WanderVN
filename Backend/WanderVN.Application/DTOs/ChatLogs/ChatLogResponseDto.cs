namespace WanderVN.Application.DTOs.ChatLogs;

public class ChatLogResponseDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? MessageText { get; set; }
    public bool? IsFromBot { get; set; }
    public DateTimeOffset? SentAt { get; set; }
}
