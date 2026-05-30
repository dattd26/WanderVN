using System;

namespace WanderVN.Application.DTOs.Request
{
    public class CreateHotelBookingRequest
    {
        public int? UserId { get; set; }

        public int RoomTypeId { get; set; }

        public string CheckInDate { get; set; } = string.Empty;

        public string CheckOutDate { get; set; } = string.Empty;

        public decimal? TotalPrice { get; set; }

        public string? Email { get; set; }

        public string? CustomerName { get; set; }

        public string? CustomerPhone { get; set; }
    }
}
