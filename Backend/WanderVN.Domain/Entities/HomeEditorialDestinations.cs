using System;

namespace WanderVN.Domain.Entities;

public partial class HomeEditorialDestinations
{
    public string Id { get; set; } = null!;
    public int LocationId { get; set; }
    public string Tags { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public string BestTime { get; set; } = null!;
    public string Experience { get; set; } = null!;
    public int StaysCount { get; set; }
    public bool IsLarge { get; set; }
    public int SortOrder { get; set; }

    public virtual Locations Location { get; set; } = null!;
}
