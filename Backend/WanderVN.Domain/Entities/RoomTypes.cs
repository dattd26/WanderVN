using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class RoomTypes
{
    public int Id { get; set; }

    public int? HotelId { get; set; }

    public string Name { get; set; } = null!;

    public decimal BasePrice { get; set; }

    public int Capacity { get; set; }

    public int TotalRooms { get; set; }

    // Mô tả ngắn cho loại phòng — ban công, view, m², tiện nghi đặc trưng
    public string? Description { get; set; }

    public virtual Hotels? Hotel { get; set; }

    public virtual ICollection<RoomTypeImages> RoomTypeImages { get; set; } = new List<RoomTypeImages>();

    public virtual ICollection<Rooms> Rooms { get; set; } = new List<Rooms>();
}
