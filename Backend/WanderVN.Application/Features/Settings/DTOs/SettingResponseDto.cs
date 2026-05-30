namespace WanderVN.Application.Features.Settings.DTOs;

public class SettingResponseDto
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public string? Description { get; set; }
}
