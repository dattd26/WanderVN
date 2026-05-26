using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class RatePlans
{
    public int Id { get; set; }

    public int RoomTypeId { get; set; }

    public string Name { get; set; } = null!;

    public decimal PriceMultiplier { get; set; }

    public bool HasBreakfast { get; set; }

    public bool IsRefundable { get; set; }

    public virtual RoomTypes RoomType { get; set; } = null!;
}
