namespace WanderVN.Application.DTOs.Response;

public class FlightBookingResponse
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty; // Duffel Order ID
    public string Status { get; set; } = string.Empty;

    /// <summary>Giá Duffel quy đổi sang VNĐ (WanderVN trả Duffel).</summary>
    public decimal DuffelAmountVnd { get; set; }

    /// <summary>Phí dịch vụ WanderVN (markup).</summary>
    public decimal MarkupAmountVnd { get; set; }

    /// <summary>Phí cổng thanh toán.</summary>
    public decimal PaymentFeeVnd { get; set; }

    /// <summary>Tổng tiền khách phải trả = DuffelAmountVnd + MarkupAmountVnd + PaymentFeeVnd.</summary>
    public decimal TotalPrice { get; set; }
}
