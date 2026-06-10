using System.Threading;
using System.Threading.Tasks;

namespace WanderVN.Application.Common.Interfaces;

public interface IVietQRService
{
    /// <summary>
    /// Tạo mã QR Code dưới dạng Data URL (Base64) để hiển thị trực tiếp lên thẻ img.
    /// </summary>
    Task<string> GenerateQRCodeAsync(string accountNo, string accountName, int acqId, decimal amount, string addInfo, CancellationToken cancellationToken = default);
}
