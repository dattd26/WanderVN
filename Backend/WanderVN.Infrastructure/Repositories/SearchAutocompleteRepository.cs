using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.Hotels.Queries.SearchAutocomplete;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

/// <summary>
/// Triển khai thực tế của ISearchAutocompleteRepository bằng cách sử dụng Dapper để tối ưu hiệu năng tối đa.
/// </summary>
public class SearchAutocompleteRepository : ISearchAutocompleteRepository
{
    private readonly WanderVNDbContext _dbContext;

    public SearchAutocompleteRepository(WanderVNDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<SearchAutocompleteDto>> SearchAutocompleteAsync(string keyword, CancellationToken cancellationToken)
    {
        var connection = _dbContext.Database.GetDbConnection();
        var resultList = new List<SearchAutocompleteDto>();

        if (connection.State == ConnectionState.Closed)
        {
            await connection.OpenAsync(cancellationToken);
        }

        var trimmedKeyword = keyword?.Trim().ToLower() ?? "";

        // TRƯỜNG HỢP 1: Từ khóa rỗng -> Trả về các địa danh du lịch nổi tiếng nhất (Đà Lạt, Phú Quốc, Hội An, Hà Giang)
        if (string.IsNullOrEmpty(trimmedKeyword))
        {
            const string popularLocationsSql = @"
                SELECT l.Id, l.Name, l.Type, l.ParentId, p.Name AS ParentName
                FROM Locations l
                LEFT JOIN Locations p ON l.ParentId = p.Id
                WHERE l.Id IN (101, 102, 104, 22)";

            var popularLocations = await connection.QueryAsync<LocationQueryRow>(
                new CommandDefinition(popularLocationsSql, cancellationToken: cancellationToken)
            );

            foreach (var loc in popularLocations)
            {
                resultList.Add(new SearchAutocompleteDto
                {
                    Id = $"loc_{loc.Id}",
                    Type = "Location",
                    Name = loc.Name,
                    Subtitle = GetLocationSubtitle(loc.Type, loc.ParentName),
                    TargetId = loc.Id
                });
            }

            return resultList;
        }

        // TRƯỜNG HỢP 2: Có nhập từ khóa -> Truy vấn song song cả Địa danh và Khách sạn

        // 1. Tìm kiếm tối đa 5 Địa danh (Locations) trùng khớp tên
        const string locationsSql = @"
            SELECT TOP 5 l.Id, l.Name, l.Type, l.ParentId, p.Name AS ParentName
            FROM Locations l
            LEFT JOIN Locations p ON l.ParentId = p.Id
            WHERE LOWER(l.Name) COLLATE Latin1_General_CI_AI LIKE @Keyword";

        var matchedLocations = await connection.QueryAsync<LocationQueryRow>(
            new CommandDefinition(locationsSql, new { Keyword = $"%{trimmedKeyword}%" }, cancellationToken: cancellationToken)
        );

        foreach (var loc in matchedLocations)
        {
            resultList.Add(new SearchAutocompleteDto
            {
                Id = $"loc_{loc.Id}",
                Type = "Location",
                Name = loc.Name,
                Subtitle = GetLocationSubtitle(loc.Type, loc.ParentName),
                TargetId = loc.Id
            });
        }

        // 2. Tìm kiếm tối đa 5 Khách sạn (Hotels) trùng khớp tên hoặc địa chỉ
        const string hotelsSql = @"
            SELECT TOP 5 h.Id, h.Name, h.StarRating, l.Name AS LocationName
            FROM Hotels h
            LEFT JOIN Locations l ON h.LocationId = l.Id
            WHERE h.IsActive = 1 AND (LOWER(h.Name) COLLATE Latin1_General_CI_AI LIKE @Keyword OR LOWER(h.Address) COLLATE Latin1_General_CI_AI LIKE @Keyword)";

        var matchedHotels = await connection.QueryAsync<HotelQueryRow>(
            new CommandDefinition(hotelsSql, new { Keyword = $"%{trimmedKeyword}%" }, cancellationToken: cancellationToken)
        );

        foreach (var hotel in matchedHotels)
        {
            resultList.Add(new SearchAutocompleteDto
            {
                Id = $"hotel_{hotel.Id}",
                Type = "Hotel",
                Name = hotel.Name,
                Subtitle = $"Khách sạn {hotel.StarRating}★ • tại {hotel.LocationName ?? "Việt Nam"}",
                TargetId = hotel.Id
            });
        }

        return resultList;
    }

    // Xác định phụ đề hiển thị phân cấp địa danh đẹp mắt giống Traveloka
    private string GetLocationSubtitle(string type, string? parentName)
    {
        if (type == "Province" || (type == "City" && string.IsNullOrEmpty(parentName)))
        {
            return "Tỉnh / Thành phố • Việt Nam";
        }
        else if (type == "District" || type == "City")
        {
            return $"Quận / Huyện • thuộc {parentName ?? "Việt Nam"}";
        }
        else if (type == "Area" || type == "Attraction")
        {
            return $"Khu vực / Địa danh • thuộc {parentName ?? "Việt Nam"}";
        }

        return "Địa danh • Việt Nam";
    }

    private class LocationQueryRow
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
    }

    private class HotelQueryRow
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int StarRating { get; set; }
        public string? LocationName { get; set; }
    }
}
