using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class BookingHotels
{
    public int Id { get; set; }

    public int? BookingId { get; set; }

    public int? RoomId { get; set; }

    public DateOnly CheckInDate { get; set; }

    public DateOnly CheckOutDate { get; set; }

    public virtual Bookings? Booking { get; set; }

    public virtual Rooms? Room { get; set; }
}
