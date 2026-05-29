namespace WanderVN.Application.Features.Admin.Hotels.Queries.GetHotelsForReview;

public class AdminHotelListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int Status { get; set; }
    public string StatusName => Status switch
    {
        0 => "Pending",
        1 => "Approved",
        2 => "Rejected",
        _ => "Unknown"
    };
    public string? RejectReason { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public int? StarRating { get; set; }
    public string? PropertyTypeName { get; set; }
    public string? PropertyTypeCode { get; set; }
    public string? LocationName { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
}
