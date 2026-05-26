namespace WanderVN.Application.DTOs.Request;

public class RatePlanDto
{
    public string Name { get; set; } = string.Empty;
    public decimal PriceMultiplier { get; set; }
    public bool HasBreakfast { get; set; }
    public bool IsRefundable { get; set; }
}
