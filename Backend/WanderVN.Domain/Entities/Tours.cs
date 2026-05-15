using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Tours
{
    public int Id { get; set; }

    public int? LocationId { get; set; }

    public string Name { get; set; } = null!;

    public int? DurationDays { get; set; }

    public decimal Price { get; set; }

    public string? Description { get; set; }

    public virtual Locations? Location { get; set; }

    public virtual ICollection<TourImages> TourImages { get; set; } = new List<TourImages>();
}
