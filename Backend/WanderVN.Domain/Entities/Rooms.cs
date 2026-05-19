using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Rooms
{
    public int Id { get; set; }

    public int HotelId { get; set; }

    public int? RoomTypeId { get; set; }

    public string RoomNumber { get; set; } = null!;

    public string? Status { get; set; }

    public virtual ICollection<BookingHotels> BookingHotels { get; set; } = new List<BookingHotels>();

    public virtual RoomTypes? RoomType { get; set; }

    public virtual Hotels Hotel { get; set; } = null!;
}
