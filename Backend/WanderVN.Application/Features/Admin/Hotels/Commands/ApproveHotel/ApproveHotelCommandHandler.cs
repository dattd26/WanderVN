using MediatR;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Admin.Hotels.Commands.ApproveHotel;

public class ApproveHotelCommandHandler : IRequestHandler<ApproveHotelCommand, ApproveHotelResult>
{
    private readonly IHotelsRepository _hotelsRepository;

    public ApproveHotelCommandHandler(IHotelsRepository hotelsRepository)
    {
        _hotelsRepository = hotelsRepository;
    }

    public async Task<ApproveHotelResult> Handle(ApproveHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await _hotelsRepository.GetForReviewAsync(request.HotelId, cancellationToken);
        if (hotel is null)
            return new ApproveHotelResult(false, "Không tìm thấy khách sạn");

        if (hotel.Status != 0)
            return new ApproveHotelResult(false, "Hồ sơ không ở trạng thái chờ duyệt");

        var ok = await _hotelsRepository.ApproveAsync(request.HotelId, cancellationToken);
        return ok
            ? new ApproveHotelResult(true, "Đã duyệt hồ sơ khách sạn")
            : new ApproveHotelResult(false, "Không thể duyệt hồ sơ. Vui lòng thử lại.");
    }
}
