using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payouts.Queries.GeneratePayoutQR;

public class GeneratePayoutQRQuery : IRequest<PayoutQRDto>
{
    public int Id { get; set; }
}

public class PayoutQRDto
{
    public string QrDataURL { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string BankBin { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string BankAccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string AddInfo { get; set; } = string.Empty;
}

public class GeneratePayoutQRQueryHandler : IRequestHandler<GeneratePayoutQRQuery, PayoutQRDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVietQRService _vietQRService;

    public GeneratePayoutQRQueryHandler(IUnitOfWork unitOfWork, IVietQRService vietQRService)
    {
        _unitOfWork = unitOfWork;
        _vietQRService = vietQRService;
    }

    public async Task<PayoutQRDto> Handle(GeneratePayoutQRQuery request, CancellationToken cancellationToken)
    {
        var payout = await _unitOfWork.PartnerPayouts.GetByIdAsync(request.Id, cancellationToken);
        if (payout == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy khoản chi trả với ID = {request.Id}.");
        }

        // Tải thông tin Partner và Booking
        var partner = await _unitOfWork.Users.GetByIdAsync(payout.PartnerId, cancellationToken);
        if (partner == null)
        {
            throw new KeyNotFoundException("Không tìm thấy thông tin đối tác nhận tiền.");
        }

        if (string.IsNullOrEmpty(partner.BankAccountNumber) ||
            string.IsNullOrEmpty(partner.BankAccountName) ||
            string.IsNullOrEmpty(partner.BankBin))
        {
            throw new InvalidOperationException("Đối tác chưa thiết lập đầy đủ thông tin tài khoản ngân hàng liên kết (STK, Tên chủ TK, Mã BIN).");
        }

        if (!int.TryParse(partner.BankBin, out int bankBinInt))
        {
            throw new InvalidOperationException("Mã BIN ngân hàng của đối tác không hợp lệ.");
        }

        var booking = await _unitOfWork.Bookings.GetByIdAsync(payout.BookingId, cancellationToken);
        var bookingCode = booking?.BookingCode ?? $"ID{payout.Id}";

        // Tạo nội dung chuyển khoản chuẩn hóa: tiếng Việt không dấu viết hoa
        // Ví dụ: WANDERVN PAYOUT 123 BK ABCD
        var addInfo = $"WANDERVN PAYOUT {payout.Id} BK {bookingCode}";
        if (addInfo.Length > 25)
        {
            addInfo = addInfo.Substring(0, 25);
        }

        var qrDataURL = await _vietQRService.GenerateQRCodeAsync(
            partner.BankAccountNumber,
            partner.BankAccountName,
            bankBinInt,
            payout.NetAmount,
            addInfo,
            cancellationToken);

        return new PayoutQRDto
        {
            QrDataURL = qrDataURL,
            BankName = partner.BankName ?? "Unknown",
            BankBin = partner.BankBin,
            BankAccountNumber = partner.BankAccountNumber,
            BankAccountName = partner.BankAccountName,
            Amount = payout.NetAmount,
            AddInfo = addInfo
        };
    }
}
