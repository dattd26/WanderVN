using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.Features.Hotels.Queries.SearchAutocomplete;

namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Giao diện repository/query service truy xuất gợi ý tự động (Autocomplete).
/// </summary>
public interface ISearchAutocompleteRepository
{
    /// <summary>
    /// Tìm kiếm gợi ý tự động địa danh & khách sạn bằng Dapper.
    /// </summary>
    Task<List<SearchAutocompleteDto>> SearchAutocompleteAsync(string keyword, CancellationToken cancellationToken);
}
