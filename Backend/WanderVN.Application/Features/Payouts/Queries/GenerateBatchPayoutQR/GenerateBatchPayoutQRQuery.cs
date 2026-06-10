using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.Payouts.Queries.GeneratePayoutQR;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Payouts.Queries.GenerateBatchPayoutQR;

public class GenerateBatchPayoutQRQuery : IRequest<PayoutQRDto>
{
    public int BatchId { get; set; }
}

public class GenerateBatchPayoutQRQueryHandler : IRequestHandler<GenerateBatchPayoutQRQuery, PayoutQRDto>
{
    private readonly IPartnerPayoutRepository _payoutRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVietQRService _vietQRService;

    public GenerateBatchPayoutQRQueryHandler(
        IPartnerPayoutRepository payoutRepository,
        IUnitOfWork unitOfWork,
        IVietQRService vietQRService)
    {
        _payoutRepository = payoutRepository;
        _unitOfWork = unitOfWork;
        _vietQRService = vietQRService;
    }

    public async Task<PayoutQRDto> Handle(GenerateBatchPayoutQRQuery request, CancellationToken cancellationToken)
    {
        var batch = await _payoutRepository.GetBatchDetailsByIdAsync(request.BatchId, cancellationToken);
        if (batch == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy đợt chi trả với ID = {request.BatchId}.");
        }

        var partner = await _unitOfWork.Users.GetByIdAsync(batch.PartnerId, cancellationToken);
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

        // Tạo nội dung chuyển khoản chuẩn hóa: tiếng Việt không dấu viết hoa
        // Ví dụ: WANDERVN BATCH ABCDE
        var addInfo = $"WANDERVN BATCH {batch.BatchCode}";
        if (addInfo.Length > 25)
        {
            addInfo = addInfo.Substring(0, 25);
        }

        var qrDataURL = await _vietQRService.GenerateQRCodeAsync(
            partner.BankAccountNumber,
            partner.BankAccountName,
            bankBinInt,
            batch.TotalNet,
            addInfo,
            cancellationToken);

        return new PayoutQRDto
        {
            QrDataURL = qrDataURL,
            BankName = partner.BankName ?? "Unknown",
            BankBin = partner.BankBin,
            BankAccountNumber = partner.BankAccountNumber,
            BankAccountName = partner.BankAccountName,
            Amount = batch.TotalNet,
            AddInfo = addInfo
        };
    }
}
