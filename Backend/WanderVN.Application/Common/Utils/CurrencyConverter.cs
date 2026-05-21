using System;

namespace WanderVN.Application.Common.Utils;

/// <summary>
/// Bộ công cụ chuyển đổi đơn vị tiền tệ trong hệ thống du lịch WanderVN.
/// </summary>
public static class CurrencyConverter
{
    // Tỷ giá quy đổi cố định từ USD sang VND (1 USD = 24,500 VND)
    public const decimal UsdToVndRate = 26500m;

    /// <summary>
    /// Chuyển đổi số tiền từ USD sang VND.
    /// </summary>
    /// <param name="usdAmount">Số tiền bằng USD.</param>
    /// <returns>Số tiền tương ứng bằng VND sau khi đã làm tròn.</returns>
    public static decimal ConvertUsdToVnd(decimal usdAmount)
    {
        return Math.Round(usdAmount * UsdToVndRate);
    }

    /// <summary>
    /// Chuyển đổi số tiền từ VND ngược lại USD.
    /// </summary>
    /// <param name="vndAmount">Số tiền bằng VND.</param>
    /// <returns>Số tiền tương ứng bằng USD.</returns>
    public static decimal ConvertVndToUsd(decimal vndAmount)
    {
        if (vndAmount <= 0) return 0m;
        return Math.Round(vndAmount / UsdToVndRate, 2);
    }
}
