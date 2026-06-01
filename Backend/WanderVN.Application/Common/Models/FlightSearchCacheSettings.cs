namespace WanderVN.Application.Common.Models;

public class FlightSearchCacheSettings
{
    public bool Enabled { get; set; } = true;
    public string KeyPrefix { get; set; } = "wandervn:flight-search:v1";
    public int MaxTtlMinutes { get; set; } = 25;
    public int ExpirySafetyBufferSeconds { get; set; } = 60;
    public int FallbackTtlMinutes { get; set; } = 10;
    public int EmptyResultTtlMinutes { get; set; } = 2;
}
