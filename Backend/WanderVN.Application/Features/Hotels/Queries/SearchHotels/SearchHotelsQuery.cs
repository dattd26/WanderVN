using System;
using System.Collections.Generic;
using MediatR;

namespace WanderVN.Application.Features.Hotels.Queries.SearchHotels;

/// <summary>
/// Query tìm kiếm khách sạn khả dụng theo địa điểm, thời gian, sức chứa và khoảng giá.
/// </summary>
public class SearchHotelsQuery : IRequest<List<SearchHotelsDto>>
{
    public int LocationId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int Capacity { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
