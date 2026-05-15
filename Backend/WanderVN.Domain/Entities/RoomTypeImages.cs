using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class RoomTypeImages
{
    public int Id { get; set; }

    public int? RoomTypeId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public bool? IsPrimary { get; set; }

    public virtual RoomTypes? RoomType { get; set; }
}
