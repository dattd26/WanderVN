using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Hotels
{
    public int Id { get; set; }

    public int? LocationId { get; set; }

    public int? OwnerId { get; set; } // ID của chủ sở hữu khách sạn (chủ homestay, partner)

    public int? PropertyTypeId { get; set; } // Khóa ngoại liên kết tới loại hình lưu trú

    public string Name { get; set; } = null!;

    public string? Address { get; set; }

    public int? StarRating { get; set; }

    public string? Description { get; set; }

    public bool? IsActive { get; set; }

    public DateTimeOffset? CreatedAt { get; set; }

    public virtual ICollection<HotelImages> HotelImages { get; set; } = new List<HotelImages>();

    public virtual Locations? Location { get; set; }

    public virtual Users? Owner { get; set; }

    public virtual PropertyTypes? PropertyType { get; set; } // Navigation property liên kết tới PropertyTypes

    public virtual ICollection<RoomTypes> RoomTypes { get; set; } = new List<RoomTypes>();

    public virtual ICollection<Rooms> Rooms { get; set; } = new List<Rooms>();

    public virtual ICollection<Amenities> Amenity { get; set; } = new List<Amenities>();
}
