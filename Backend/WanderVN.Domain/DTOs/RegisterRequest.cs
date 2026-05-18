namespace WanderVN.Domain.DTOs
{
    public class RegisterRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
    }
}