using System.Collections.Generic;

namespace WanderVN.Application.Features.Home.Queries.GetHomeData;

public class HomeTravelMoodDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string IconName { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public string QueryString { get; set; } = null!;
}

public class HomeEditorialDestinationDto
{
    public string Id { get; set; } = null!;
    public int LocationId { get; set; }
    public string LocationName { get; set; } = null!;
    public List<string> Tags { get; set; } = new();
    public string ImageUrl { get; set; } = null!;
    public string BestTime { get; set; } = null!;
    public string Experience { get; set; } = null!;
    public int StaysCount { get; set; }
    public bool IsLarge { get; set; }
}

public class HomeWeekendEscapeDto
{
    public int Id { get; set; }
    public string Origin { get; set; } = null!;
    public int LocationId { get; set; }
    public string LocationName { get; set; } = null!;
    public string Duration { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
}

public class HomeStayCollectionDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public int StaysCount { get; set; }
    public string QueryString { get; set; } = null!;
}
