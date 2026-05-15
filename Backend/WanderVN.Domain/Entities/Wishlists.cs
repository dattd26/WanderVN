using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Wishlists
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public int? ServiceId { get; set; }

    public string? ServiceType { get; set; }

    public virtual Users? User { get; set; }
}
