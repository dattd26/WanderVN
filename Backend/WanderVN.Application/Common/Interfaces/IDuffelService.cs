using System.Threading.Tasks;
using WanderVN.Application.DTOs.Request;

namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Interface giao tiếp với dịch vụ cung cấp vé máy bay Duffel.
/// </summary>
public interface IDuffelService
{
    /// <summary>
    /// Gửi request tìm kiếm chuyến bay và nhận lại chuỗi JSON chứa danh sách Offers từ Duffel.
    /// </summary>
    Task<string> SearchOffersAsync(DuffelOfferRequestDto request);

    /// <summary>
    /// Gửi request tạo Order (đặt vé) và nhận lại chuỗi JSON chứa thông tin Order từ Duffel.
    /// </summary>
    Task<string> CreateOrderAsync(DuffelOrderRequestDto request);

    /// <summary>
    /// Lấy chi tiết thông tin một Offer bằng ID (phục vụ đồng bộ giá sandbox).
    /// </summary>
    Task<string> GetOfferAsync(string offerId);

    /// <summary>
    /// Gửi request thanh toán cho Order (dùng khi Order đang ở trạng thái hold)
    /// </summary>
    Task<string> PayOrderAsync(string orderId, string paymentAmount, string paymentCurrency);
}
