using MediatR;

namespace WanderVN.Application.Features.Partner.Commands.UploadHotelImage;

/// <summary>
/// Command upload ảnh khách sạn lên Cloudinary và lưu metadata vào HotelImages
/// qua <c>sp_Partner_AddHotelImage</c>. Controller truyền <see cref="FileStream"/>
/// đã đọc từ IFormFile để Application layer không cần biết về ASP.NET Http types.
/// </summary>
public class UploadHotelImageCommand : IRequest<UploadHotelImageResponse>
{
    public int HotelId { get; set; }

    /// <summary>Stream nội dung file ảnh — Controller mở từ IFormFile.OpenReadStream().</summary>
    public Stream FileStream { get; set; } = Stream.Null;

    /// <summary>Tên file gốc, dùng để Cloudinary suy ra extension.</summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>Đánh dấu ảnh đại diện (chỉ 1 ảnh mỗi hotel). Default false.</summary>
    public bool IsPrimary { get; set; }
}

public class UploadHotelImageResponse
{
    public int ImageId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}
