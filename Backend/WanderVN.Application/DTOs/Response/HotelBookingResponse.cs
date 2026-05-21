using System;

namespace WanderVN.Application.DTOs.Response
{
    public class HotelBookingResponse
    {
        public int BookingId { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}