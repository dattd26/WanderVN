using WanderVN.Domain.Enums;

namespace WanderVN.Application.Features.Partner.DTOs;

/// <summary>
/// DTO trả về cho màn hình Dashboard của Partner, chứa thông tin tổng quan
/// về khách sạn, trạng thái duyệt và thống kê cơ bản.
/// </summary>
public class PartnerHotelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int? StarRating { get; set; }
    public string? Description { get; set; }

    /// <summary>0=Pending, 1=Approved, 2=Rejected</summary>
    public int Status { get; set; }

    /// <summary>Enum strongly-typed cho Frontend hiển thị nhãn/màu.</summary>
    public string StatusName => ((HotelStatus)Status).ToString();

    public string? CancellationPolicy { get; set; }

    /// <summary>Lý do từ chối (nếu Status=2)</summary>
    public string? RejectReason { get; set; }

    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }

    public string? LocationName { get; set; }
    public string? PropertyTypeName { get; set; }
    public string? PropertyTypeCode { get; set; }

    /// <summary>Ảnh đại diện đầu tiên của khách sạn</summary>
    public string? PrimaryImageUrl { get; set; }

    /// <summary>Số lượng loại phòng đã cấu hình</summary>
    public int RoomTypeCount { get; set; }

    /// <summary>Tổng số lượng đơn đặt phòng (tính từ bảng Bookings)</summary>
    public int TotalBookings { get; set; }
}
