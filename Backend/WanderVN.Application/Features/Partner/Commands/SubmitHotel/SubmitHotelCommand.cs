using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.SubmitHotel;

/// <summary>
/// Command để partner submit khách sạn mới ở trạng thái Pending (Status=0),
/// chờ admin duyệt. PartnerId được lấy từ JWT (CurrentUserService), KHÔNG nhận
/// từ client để chống forging.
/// </summary>
public class SubmitHotelCommand : IRequest<SubmitHotelResponse>
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    /// <summary>Liên kết tới Locations (thành phố/tỉnh). Optional ở step Onboarding.</summary>
    public int? LocationId { get; set; }

    /// <summary>Loại hình lưu trú (Hotel / Homestay / Resort / Villa...). Lấy từ /api/v1/property-types.</summary>
    public int? PropertyTypeId { get; set; }

    public string? Description { get; set; }

    /// <summary>Sao tự đánh giá (1-5). Admin có thể chỉnh sửa khi duyệt.</summary>
    public int? StarRating { get; set; }

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    /// <summary>Chính sách hủy phòng: flexible | moderate | strict.</summary>
    public string? CancellationPolicy { get; set; }

    /// <summary>Danh sách AmenityId chọn từ bảng Amenities (wifi, parking, pool...).</summary>
    public List<int> AmenityIds { get; set; } = new();
}

public class SubmitHotelResponse
{
    public int HotelId { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string Status { get; set; } = "Pending";
}
