using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Amenities
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? IconName { get; set; }

    public virtual ICollection<Hotels> Hotel { get; set; } = new List<Hotels>();
}
