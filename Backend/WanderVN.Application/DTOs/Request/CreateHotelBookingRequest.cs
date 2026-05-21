using System;

namespace WanderVN.Application.DTOs.Request
{
    public class CreateHotelBookingRequest
    {
        // Id ngý?i dùng th?c hi?n ð?t ph?ng
        public int UserId { get; set; }

        // Id c?a RoomType mà ngý?i dùng mu?n ð?t
        public int RoomTypeId { get; set; }

        // Ð?nh d?ng: yyyy-MM-dd
        public string CheckInDate { get; set; } = string.Empty;

        // Ð?nh d?ng: yyyy-MM-dd
        public string CheckOutDate { get; set; } = string.Empty;

        // T?ng ti?n d? ki?n (n?u null s? dùng giá BasePrice c?a RoomType)
        public decimal? TotalPrice { get; set; }
    }
}