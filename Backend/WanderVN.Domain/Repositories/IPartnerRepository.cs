namespace WanderVN.Domain.Repositories;

/// <summary>
/// DTO chứa dữ liệu trả về cho dashboard khách sạn của partner.
/// Nằm trong Domain layer để Repository interface có thể trả về mà không bị circular dependency.
/// </summary>
public class PartnerHotelDashboardModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int? StarRating { get; set; }
    public string? Description { get; set; }
    public int Status { get; set; }
    public string? CancellationPolicy { get; set; }
    public string? RejectReason { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public string? LocationName { get; set; }
    public string? PropertyTypeName { get; set; }
    public string? PropertyTypeCode { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public int RoomTypeCount { get; set; }
    public int TotalBookings { get; set; }
}

/// <summary>
/// Kết quả trả về khi partner submit hotel mới — dùng để response cho client biết
/// hotel đã được tạo với Id nào và submitted vào thời điểm nào.
/// </summary>
public class SubmitHotelResult
{
    public int NewHotelId { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
}

/// <summary>
/// Repository cho các thao tác đặc thù của Partner (chủ cơ sở lưu trú).
/// Toàn bộ thao tác đều đi qua Stored Procedure để bảo đảm authorization
/// (kiểm tra OwnerId/PartnerId) và đóng gói business logic ở DB layer.
/// </summary>
public interface IPartnerRepository
{
    /// <summary>
    /// Lấy danh sách các khách sạn của đối tác kèm theo trạng thái duyệt và thống kê
    /// qua Stored Procedure <c>sp_Partner_ListMyHotels</c>.
    /// </summary>
    Task<List<PartnerHotelDashboardModel>> ListMyHotelsAsync(
        int partnerId,
        int? statusFilter,
        CancellationToken cancellationToken);

    /// <summary>
    /// Tạo hotel mới ở trạng thái Pending (Status=0) qua <c>sp_Partner_SubmitHotel</c>.
    /// SP kiểm tra @PartnerId phải có role Partner đang active, ngược lại raise 403.
    /// </summary>
    Task<SubmitHotelResult> SubmitHotelAsync(
        int partnerId,
        string name,
        string address,
        int? locationId,
        int? propertyTypeId,
        string? description,
        int? starRating,
        decimal? latitude,
        decimal? longitude,
        string? cancellationPolicy,
        string? amenityIdsCsv,
        CancellationToken cancellationToken);

    /// <summary>
    /// Thêm ảnh khách sạn qua <c>sp_Partner_AddHotelImage</c>.
    /// SP kiểm tra hotel thuộc về partner (OwnerId == partnerId), nếu không raise 403.
    /// Nếu <paramref name="isPrimary"/>=true sẽ reset các ảnh khác về 0.
    /// </summary>
    /// <returns>Id của HotelImages record vừa tạo.</returns>
    Task<int> AddHotelImageAsync(
        int partnerId,
        int hotelId,
        string imageUrl,
        string? publicId,
        bool isPrimary,
        CancellationToken cancellationToken);

    /// <summary>
    /// Thêm hạng phòng mới cho khách sạn của đối tác qua <c>sp_Partner_AddRoomType</c>.
    /// SP kiểm tra quyền sở hữu khách sạn (OwnerId == partnerId), nếu không raise 403.
    /// </summary>
    /// <returns>Id của RoomTypes record mới tạo.</returns>
    Task<int> AddRoomTypeAsync(
        int partnerId,
        int hotelId,
        string name,
        decimal basePrice,
        int capacity,
        int totalRooms,
        string? description,
        CancellationToken cancellationToken);

    /// <summary>
    /// Xóa hạng phòng của khách sạn đối tác qua <c>sp_Partner_DeleteRoomType</c>.
    /// SP kiểm tra quyền sở hữu khách sạn (OwnerId == partnerId), nếu không raise 403.
    /// </summary>
    /// <returns>Số dòng bị ảnh hưởng.</returns>
    Task<int> DeleteRoomTypeAsync(
        int partnerId,
        int roomTypeId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Cập nhật hạng phòng của khách sạn đối tác qua <c>sp_Partner_UpdateRoomType</c>.
    /// SP kiểm tra quyền sở hữu khách sạn (OwnerId == partnerId), nếu không raise 403.
    /// </summary>
    /// <returns>Số dòng bị ảnh hưởng.</returns>
    Task<int> UpdateRoomTypeAsync(
        int partnerId,
        int roomTypeId,
        string name,
        decimal basePrice,
        int capacity,
        int totalRooms,
        CancellationToken cancellationToken);
}
