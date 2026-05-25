using System;
using System.Collections.Generic;

namespace WanderVN.Application.DTOs.Response;

/// <summary>
/// DTO chi tiết đầy đủ cho một Offer từ Duffel API.
/// Dùng cho endpoint GET /api/v1/flights/offers/{offerId}.
/// </summary>
public class GetFlightOfferDetailDto
{
    // ─── Identity ────────────────────────────────────────────────────────────

    public string OfferId { get; set; } = string.Empty;

    // ─── Airline ─────────────────────────────────────────────────────────────

    public string Airline { get; set; } = string.Empty;
    public string AirlineLogo { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string Aircraft { get; set; } = string.Empty;

    // ─── Route ───────────────────────────────────────────────────────────────

    public string DepartureAirport { get; set; } = string.Empty;
    public string DepartureAirportCode { get; set; } = string.Empty;
    public string DepartureTerminal { get; set; } = string.Empty;
    public string ArrivalAirport { get; set; } = string.Empty;
    public string ArrivalAirportCode { get; set; } = string.Empty;
    public string ArrivalTerminal { get; set; } = string.Empty;

    // ─── Schedule ────────────────────────────────────────────────────────────

    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public string Duration { get; set; } = string.Empty;
    public int Stops { get; set; } = 0;

    // ─── Cabin ───────────────────────────────────────────────────────────────

    public string CabinClass { get; set; } = string.Empty;
    public int AvailableSeats { get; set; }

    // ─── Validity ────────────────────────────────────────────────────────────

    public bool IsValid { get; set; }
    public bool IsExpired { get; set; }
    public DateTime? ExpiresAt { get; set; }

    // ─── Pricing ─────────────────────────────────────────────────────────────

    public decimal TotalAmount { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public string Currency { get; set; } = "USD";

    // ─── Passenger Benefits ──────────────────────────────────────────────────

    public string BaggageInfo { get; set; } = string.Empty;
    public string CabinBaggageInfo { get; set; } = string.Empty;
    public string MealInfo { get; set; } = string.Empty;
    public bool WifiAvailable { get; set; }
    public string SeatInfo { get; set; } = string.Empty;

    // ─── Slices & Segments ───────────────────────────────────────────────────

    public List<FlightSliceDetailDto> Slices { get; set; } = new();

    // ─── Raw Passthrough ─────────────────────────────────────────────────────

    /// <summary>
    /// Passenger ID cần thiết để đặt vé (lấy từ offer.passengers[0].id).
    /// </summary>
    public string PassengerId { get; set; } = string.Empty;
}

public class FlightSliceDetailDto
{
    public string Origin { get; set; } = string.Empty;
    public string OriginCode { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string DestinationCode { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public List<FlightSegmentDetailDto> Segments { get; set; } = new();
}

public class FlightSegmentDetailDto
{
    public string FlightNumber { get; set; } = string.Empty;
    public string Aircraft { get; set; } = string.Empty;
    public string CarrierCode { get; set; } = string.Empty;
    public string CarrierName { get; set; } = string.Empty;
    public string CarrierLogo { get; set; } = string.Empty;
    public string DepartureAirportCode { get; set; } = string.Empty;
    public string DepartureAirportName { get; set; } = string.Empty;
    public string DepartureTerminal { get; set; } = string.Empty;
    public string ArrivalAirportCode { get; set; } = string.Empty;
    public string ArrivalAirportName { get; set; } = string.Empty;
    public string ArrivalTerminal { get; set; } = string.Empty;
    public DateTime DepartingAt { get; set; }
    public DateTime ArrivingAt { get; set; }
    public string Duration { get; set; } = string.Empty;
    public string CabinClass { get; set; } = string.Empty;
}
