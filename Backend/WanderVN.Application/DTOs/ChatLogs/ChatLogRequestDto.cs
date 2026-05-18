namespace WanderVN.Application.DTOs.ChatLogs;

public class ChatLogRequestDto
{
    public int? UserId { get; set; }
    public string? MessageText { get; set; }
    public bool? IsFromBot { get; set; }
}
