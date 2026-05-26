namespace WanderVN.Domain.Enums;

/// <summary>
/// Trạng thái workflow của một Hotel trong luồng Partner Onboarding.
/// Ánh xạ trực tiếp tới cột <c>Hotels.Status (INT)</c> trong DB.
/// </summary>
public enum HotelStatus
{
    /// <summary>Partner vừa submit, chờ Admin xét duyệt.</summary>
    Pending = 0,

    /// <summary>Admin đã duyệt — hotel hiển thị trên public search.</summary>
    Approved = 1,

    /// <summary>Admin từ chối — partner xem <c>RejectReason</c> để sửa và submit lại.</summary>
    Rejected = 2,
}
