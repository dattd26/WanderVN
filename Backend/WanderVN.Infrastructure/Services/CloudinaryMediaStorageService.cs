using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Models;

namespace WanderVN.Infrastructure.Services;

/// <summary>
/// Triển khai <see cref="IMediaStorageService"/> dùng Cloudinary làm backend lưu trữ ảnh.
/// Cloudinary cung cấp CDN, transform on-the-fly và free tier đủ cho giai đoạn dev/staging.
/// </summary>
public class CloudinaryMediaStorageService : IMediaStorageService
{
    private readonly Cloudinary _cloudinary;
    private readonly CloudinarySettings _settings;
    private readonly ILogger<CloudinaryMediaStorageService> _logger;

    public CloudinaryMediaStorageService(
        IOptions<CloudinarySettings> options,
        ILogger<CloudinaryMediaStorageService> logger)
    {
        _settings = options.Value;
        _logger = logger;

        if (string.IsNullOrWhiteSpace(_settings.CloudName) ||
            string.IsNullOrWhiteSpace(_settings.ApiKey) ||
            string.IsNullOrWhiteSpace(_settings.ApiSecret))
        {
            throw new InvalidOperationException(
                "Thiếu cấu hình Cloudinary. Vui lòng kiểm tra section 'Cloudinary' trong appsettings (CloudName, ApiKey, ApiSecret).");
        }

        var account = new Account(_settings.CloudName, _settings.ApiKey, _settings.ApiSecret);
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    public async Task<MediaUploadResult> UploadImageAsync(
        Stream fileStream,
        string fileName,
        string? folder = null,
        CancellationToken cancellationToken = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = folder ?? _settings.HotelFolder,
            // Cloudinary tự sinh PublicId duy nhất (không cần truyền)
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false
        };

        _logger.LogInformation("Đang upload ảnh '{FileName}' lên Cloudinary folder '{Folder}'...",
            fileName, uploadParams.Folder);

        var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (result.Error != null)
        {
            _logger.LogError("Upload Cloudinary thất bại: {Error}", result.Error.Message);
            throw new InvalidOperationException($"Upload ảnh thất bại: {result.Error.Message}");
        }

        _logger.LogInformation("Upload thành công. PublicId={PublicId}, Url={Url}",
            result.PublicId, result.SecureUrl);

        return new MediaUploadResult
        {
            SecureUrl = result.SecureUrl.ToString(),
            PublicId = result.PublicId
        };
    }

    public async Task<bool> DeleteImageAsync(string publicId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(publicId))
            return false;

        var deletionParams = new DeletionParams(publicId)
        {
            ResourceType = ResourceType.Image
        };

        var result = await _cloudinary.DestroyAsync(deletionParams);

        if (result.Error != null)
        {
            _logger.LogWarning("Xoá ảnh Cloudinary thất bại. PublicId={PublicId}, Error={Error}",
                publicId, result.Error.Message);
            return false;
        }

        // Cloudinary trả "ok" khi xóa thành công, "not found" nếu ảnh không tồn tại
        var success = string.Equals(result.Result, "ok", StringComparison.OrdinalIgnoreCase);
        _logger.LogInformation("Xoá ảnh Cloudinary PublicId={PublicId} - Result={Result}",
            publicId, result.Result);
        return success;
    }
}
