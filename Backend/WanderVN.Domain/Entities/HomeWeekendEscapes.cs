using System;

namespace WanderVN.Domain.Entities;

public partial class HomeWeekendEscapes
{
    public int Id { get; set; }
    public string Origin { get; set; } = null!;
    public int LocationId { get; set; }
    public string Duration { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public int SortOrder { get; set; }

    public virtual Locations Location { get; set; } = null!;
}
