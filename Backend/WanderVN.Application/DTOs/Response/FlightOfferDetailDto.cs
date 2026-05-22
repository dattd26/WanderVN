using System;

namespace WanderVN.Application.DTOs.Response;

public class FlightOfferDetailDto
{
    public string Id { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string TotalCurrency { get; set; } = "USD";
    public string PassengerId { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string OriginCode { get; set; } = string.Empty;
    public string OriginName { get; set; } = string.Empty;
    public string DestinationCode { get; set; } = string.Empty;
    public string DestinationName { get; set; } = string.Empty;
    public DateTime DepartingAt { get; set; }
    public DateTime ArrivingAt { get; set; }
    public string CarrierCode { get; set; } = string.Empty;
    public string CarrierName { get; set; } = string.Empty;
    public string CarrierLogoUrl { get; set; } = string.Empty;
    public string AircraftName { get; set; } = string.Empty;
    public string DuffelAirwaysOfferId { get; set; } = string.Empty;
    public string DuffelAirwaysPassengerId { get; set; } = string.Empty;
    public int AvailableSeats { get; set; }
    public string ExpiresAt { get; set; } = string.Empty;
    public bool IsExpired { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ValidationStatus { get; set; } = string.Empty;
}
