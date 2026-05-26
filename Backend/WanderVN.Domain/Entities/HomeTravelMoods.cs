using System;

namespace WanderVN.Domain.Entities;

public partial class HomeTravelMoods
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string IconName { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public string QueryString { get; set; } = null!;
    public int SortOrder { get; set; }
}
