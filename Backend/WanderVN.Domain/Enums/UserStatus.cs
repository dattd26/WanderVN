namespace WanderVN.Domain.Enums;

/// <summary>
/// Trạng thái xét duyệt vòng đời của một tài khoản (chủ yếu áp dụng cho Partner).
/// Ánh xạ trực tiếp tới cột <c>Users.Status (INT)</c> trong DB.
/// Lưu ý: <c>Status</c> là trạng thái DUYỆT hồ sơ, độc lập với <c>IsActive</c> (cờ khóa/mở tài khoản).
/// </summary>
public enum UserStatus
{
    /// <summary>Partner vừa đăng ký, chờ Admin xét duyệt. (Customer được set thẳng Active.)</summary>
    Pending = 0,

    /// <summary>Admin đã duyệt — tài khoản hợp lệ. Bị khóa hay không do <c>IsActive</c> quyết định.</summary>
    Active = 1,

    /// <summary>Admin từ chối hồ sơ đăng ký Partner.</summary>
    Rejected = 2,
}
