using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Airlines
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? LogoUrl { get; set; }

    public virtual ICollection<Flights> Flights { get; set; } = new List<Flights>();
}
