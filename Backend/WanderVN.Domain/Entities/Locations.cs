using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Locations
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public virtual ICollection<Hotels> Hotels { get; set; } = new List<Hotels>();

    public virtual ICollection<Tours> Tours { get; set; } = new List<Tours>();
}
