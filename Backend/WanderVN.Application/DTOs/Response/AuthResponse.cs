namespace WanderVN.Application.DTOs.Response;

public class AuthResponse
{
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}