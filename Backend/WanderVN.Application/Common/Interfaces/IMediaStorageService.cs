namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Kết quả upload media — trả về URL công khai và PublicId (dùng để xóa/transform sau này).
/// </summary>
public class MediaUploadResult
{
    /// <summary>URL HTTPS công khai dùng để hiển thị ảnh trên frontend.</summary>
    public string SecureUrl { get; set; } = string.Empty;

    /// <summary>Public ID của Cloudinary, lưu vào DB để có thể xoá hoặc transform về sau.</summary>
    public string PublicId { get; set; } = string.Empty;
}

/// <summary>
/// Trừu tượng lớp lưu trữ media (ảnh, file). Hiện đang dùng Cloudinary, có thể thay
/// bằng S3 / Azure Blob mà không sửa code Application layer.
/// </summary>
public interface IMediaStorageService
{
    /// <summary>
    /// Upload ảnh từ stream lên storage backend.
    /// </summary>
    /// <param name="fileStream">Stream nội dung file ảnh.</param>
    /// <param name="fileName">Tên file gốc (để Cloudinary suy ra extension).</param>
    /// <param name="folder">Thư mục đích trên storage. Nếu null sẽ dùng folder mặc định trong settings.</param>
    /// <param name="cancellationToken">Cancellation token để hủy upload.</param>
    /// <returns>URL công khai và PublicId của ảnh.</returns>
    Task<MediaUploadResult> UploadImageAsync(
        Stream fileStream,
        string fileName,
        string? folder = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Xoá ảnh đã upload bằng PublicId. Dùng khi partner xoá ảnh khách sạn hoặc khi rollback.
    /// </summary>
    /// <param name="publicId">PublicId của ảnh trên storage.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True nếu xóa thành công, false nếu ảnh không tồn tại hoặc có lỗi.</returns>
    Task<bool> DeleteImageAsync(string publicId, CancellationToken cancellationToken = default);
}
