using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class TourImages
{
    public int Id { get; set; }

    public int? TourId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public bool? IsPrimary { get; set; }

    public virtual Tours? Tour { get; set; }
}
