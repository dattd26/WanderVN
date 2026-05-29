using System;

namespace WanderVN.Domain.Entities;

public partial class HomeStayCollections
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public int StaysCount { get; set; }
    public string QueryString { get; set; } = null!;
    public int SortOrder { get; set; }
}
