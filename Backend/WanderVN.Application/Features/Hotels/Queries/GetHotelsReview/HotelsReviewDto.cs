using System;
using System.Collections.Generic;

namespace WanderVN.Application.Features.Hotels.Queries.GetHotelsReview;

public class HotelsReviewDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string PartnerName { get; set; } = string.Empty;
    public string PartnerCode { get; set; } = string.Empty;
    public DateTimeOffset? SubmittedAt { get; set; }
    public string SubmittedTime { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string Thumbnail { get; set; } = string.Empty;
    public List<string> Gallery { get; set; } = new();
    public string Description { get; set; } = string.Empty;
    public string Area { get; set; } = "N/A";
    public string Scale { get; set; } = "0 Phòng";
    public List<ReviewRoomTypeDto> RoomTypes { get; set; } = new();
    public string? RejectReason { get; set; }
}

public class ReviewRoomTypeDto
{
    public string Name { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Icon { get; set; } = "bed";
    public string Price { get; set; } = string.Empty;
}
