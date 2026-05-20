using System.Collections.Generic;

namespace WanderVN.Application.DTOs.Request;

public class CreateFlightBookingRequest
{
    public int UserId { get; set; }
    
    // The Duffel Offer ID to book
    public string OfferId { get; set; } = string.Empty;
    
    // The expected total price to save in DB
    public decimal TotalPrice { get; set; }
    
    public List<PassengerDto> Passengers { get; set; } = new();
}

public class PassengerDto
{
    // The Duffel Passenger ID (from the offer)
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = "mr";
    public string FamilyName { get; set; } = string.Empty;
    public string GivenName { get; set; } = string.Empty;
    
    // Format YYYY-MM-DD
    public string BornOn { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    // "m" or "f"
    public string Gender { get; set; } = string.Empty;
    
    public string PassportNumber { get; set; } = string.Empty;
}
