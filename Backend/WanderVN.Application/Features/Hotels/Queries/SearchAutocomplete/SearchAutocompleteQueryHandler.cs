using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Hotels.Queries.SearchAutocomplete;

/// <summary>
/// Handler xử lý nghiệp vụ tìm kiếm gợi ý tự động (Autocomplete) địa điểm & khách sạn.
/// </summary>
public class SearchAutocompleteQueryHandler : IRequestHandler<SearchAutocompleteQuery, List<SearchAutocompleteDto>>
{
    private readonly IApplicationDbContext _context;

    public SearchAutocompleteQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SearchAutocompleteDto>> Handle(SearchAutocompleteQuery request, CancellationToken cancellationToken)
    {
        var resultList = new List<SearchAutocompleteDto>();
        var keyword = request.Keyword?.Trim().ToLower() ?? "";

        // TRƯỜNG HỢP 1: Từ khóa rỗng -> Trả về các địa danh du lịch nổi tiếng nhất (Đà Lạt, Phú Quốc, Hội An, Hà Giang)
        if (string.IsNullOrEmpty(keyword))
        {
            // Tìm các ID địa danh đặc trưng từ dữ liệu Seed
            var popularLocations = await _context.Locations
                .Include(l => l.Parent)
                .Where(l => l.Id == 101 || l.Id == 102 || l.Id == 104 || l.Id == 22)
                .ToListAsync(cancellationToken);

            foreach (var loc in popularLocations)
            {
                resultList.Add(new SearchAutocompleteDto
                {
                    Id = $"loc_{loc.Id}",
                    Type = "Location",
                    Name = loc.Name,
                    Subtitle = GetLocationSubtitle(loc),
                    TargetId = loc.Id
                });
            }

            return resultList;
        }

        // TRƯỜNG HỢP 2: Có nhập từ khóa -> Truy vấn song song cả Địa danh và Khách sạn
        
        // 1. Tìm kiếm Địa danh (Locations) trùng khớp tên
        var matchedLocations = await _context.Locations
            .Include(l => l.Parent)
            .Where(l => l.Name.ToLower().Contains(keyword))
            .Take(5)
            .ToListAsync(cancellationToken);

        foreach (var loc in matchedLocations)
        {
            resultList.Add(new SearchAutocompleteDto
            {
                Id = $"loc_{loc.Id}",
                Type = "Location",
                Name = loc.Name,
                Subtitle = GetLocationSubtitle(loc),
                TargetId = loc.Id
            });
        }

        // 2. Tìm kiếm Khách sạn (Hotels) trùng khớp tên hoặc địa chỉ
        var matchedHotels = await _context.Hotels
            .Include(h => h.Location)
            .Where(h => h.IsActive == true && (h.Name.ToLower().Contains(keyword) || (h.Address != null && h.Address.ToLower().Contains(keyword))))
            .Take(5)
            .ToListAsync(cancellationToken);

        foreach (var hotel in matchedHotels)
            resultList.Add(new SearchAutocompleteDto
            {
                Id = $"hotel_{hotel.Id}",
                Type = "Hotel",
                Name = hotel.Name,
                Subtitle = $"Khách sạn {hotel.StarRating}★ • tại {hotel.Location?.Name ?? "Việt Nam"}",
                TargetId = hotel.Id
            });

        return resultList;
    }

    // Xác định phụ đề hiển thị phân cấp địa danh đẹp mắt giống Traveloka
    private string GetLocationSubtitle(Domain.Entities.Locations loc)
    {
        if (loc.Type == "Province" || (loc.Type == "City" && loc.ParentId == null))
        {
            return "Tỉnh / Thành phố • Việt Nam";
        }
        else if (loc.Type == "District" || loc.Type == "City")
        {
            return $"Quận / Huyện • thuộc {loc.Parent?.Name ?? "Việt Nam"}";
        }
        else if (loc.Type == "Area" || loc.Type == "Attraction")
        {
            return $"Khu vực / Địa danh • thuộc {loc.Parent?.Name ?? "Việt Nam"}";
        }

        return "Địa danh • Việt Nam";
    }
}
