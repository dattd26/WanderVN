using System.Collections.Generic;
using MediatR;

namespace WanderVN.Application.Features.Hotels.Queries.SearchAutocomplete;

/// <summary>
/// Query yêu cầu gợi ý tự động tìm kiếm (Autocomplete) địa điểm và khách sạn.
/// Phù hợp với giao diện tìm kiếm nâng cao kiểu Traveloka.
/// </summary>
public class SearchAutocompleteQuery : IRequest<List<SearchAutocompleteDto>>
{
    // Từ khóa tìm kiếm do người dùng nhập (ví dụ: "Phú Quốc", "Edense")
    public string? Keyword { get; set; }
}

/// <summary>
/// DTO chứa thông tin gợi ý trả về cho người dùng.
/// </summary>
public class SearchAutocompleteDto
{
    // ID duy nhất cho phía giao diện (ví dụ: "loc_101", "hotel_11")
    public string Id { get; set; } = null!;

    // Phân loại gợi ý: "Location" (Địa điểm) hoặc "Hotel" (Khách sạn)
    public string Type { get; set; } = null!;

    // Tên chính hiển thị (ví dụ: "Đà Lạt", "WanderVN Edense Lake Resort Dalat")
    public string Name { get; set; } = null!;

    // Mô tả chi tiết phụ trợ (ví dụ: "Thành phố • thuộc Lâm Đồng", "Khách sạn 5★ • Hồ Tuyền Lâm")
    public string Subtitle { get; set; } = null!;

    // ID nguyên bản trong cơ sở dữ liệu để gọi API tiếp theo
    public int TargetId { get; set; }
}
