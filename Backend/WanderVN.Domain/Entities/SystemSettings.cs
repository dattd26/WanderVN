namespace WanderVN.Domain.Entities;

public class SystemSettings
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public string? Description { get; set; }
}
