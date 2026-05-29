using MediatR;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Flights.Queries.GetFlightOfferDetail;

/// <summary>
/// MediatR Query để lấy chi tiết đầy đủ một Offer từ Duffel API theo ID.
/// </summary>
public class GetFlightOfferDetailQuery : IRequest<GetFlightOfferDetailDto>
{
    /// <summary>
    /// ID của Offer Duffel (ví dụ: off_0000...).
    /// </summary>
    public string OfferId { get; set; } = string.Empty;
}
