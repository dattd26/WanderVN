using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Hotels
{
    public int Id { get; set; }

    public int? LocationId { get; set; }

    public string Name { get; set; } = null!;

    public string? Address { get; set; }

    public int? StarRating { get; set; }

    public string? Description { get; set; }

    public bool? IsActive { get; set; }

    public DateTimeOffset? CreatedAt { get; set; }

    public virtual ICollection<HotelImages> HotelImages { get; set; } = new List<HotelImages>();

    public virtual Locations? Location { get; set; }

    public virtual ICollection<RoomTypes> RoomTypes { get; set; } = new List<RoomTypes>();

    public virtual ICollection<Amenities> Amenity { get; set; } = new List<Amenities>();
}
