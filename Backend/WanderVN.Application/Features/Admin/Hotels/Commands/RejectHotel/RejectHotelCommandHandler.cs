using MediatR;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Admin.Hotels.Commands.RejectHotel;

public class RejectHotelCommandHandler : IRequestHandler<RejectHotelCommand, RejectHotelResult>
{
    private readonly IHotelsRepository _hotelsRepository;

    public RejectHotelCommandHandler(IHotelsRepository hotelsRepository)
    {
        _hotelsRepository = hotelsRepository;
    }

    public async Task<RejectHotelResult> Handle(RejectHotelCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            return new RejectHotelResult(false, "Vui lòng nhập lý do từ chối");

        var hotel = await _hotelsRepository.GetForReviewAsync(request.HotelId, cancellationToken);
        if (hotel is null)
            return new RejectHotelResult(false, "Không tìm thấy khách sạn");

        if (hotel.Status != 0)
            return new RejectHotelResult(false, "Hồ sơ không ở trạng thái chờ duyệt");

        var ok = await _hotelsRepository.RejectAsync(request.HotelId, request.Reason.Trim(), cancellationToken);
        return ok
            ? new RejectHotelResult(true, "Đã từ chối hồ sơ khách sạn")
            : new RejectHotelResult(false, "Không thể từ chối hồ sơ. Vui lòng thử lại.");
    }
}
