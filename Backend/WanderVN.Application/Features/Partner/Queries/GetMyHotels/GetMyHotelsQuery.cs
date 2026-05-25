using MediatR;
using WanderVN.Application.Features.Partner.DTOs;

namespace WanderVN.Application.Features.Partner.Queries.GetMyHotels;

/// <summary>
/// Query lấy danh sách khách sạn do partner quản lý (dashboard list).
/// PartnerId tự động lấy từ JWT.
/// </summary>
public class GetMyHotelsQuery : IRequest<List<PartnerHotelDto>>
{
    /// <summary>Optional filter: 0=Pending, 1=Approved, 2=Rejected</summary>
    public int? Status { get; set; }
}
