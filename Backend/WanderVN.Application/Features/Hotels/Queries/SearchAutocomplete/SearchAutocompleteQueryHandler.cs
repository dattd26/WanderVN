using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Hotels.Queries.SearchAutocomplete;

/// <summary>
/// Handler xử lý nghiệp vụ tìm kiếm gợi ý tự động (Autocomplete) địa điểm & khách sạn.
/// </summary>
public class SearchAutocompleteQueryHandler : IRequestHandler<SearchAutocompleteQuery, List<SearchAutocompleteDto>>
{
    private readonly ISearchAutocompleteRepository _searchAutocompleteRepository;

    public SearchAutocompleteQueryHandler(ISearchAutocompleteRepository searchAutocompleteRepository)
    {
        _searchAutocompleteRepository = searchAutocompleteRepository;
    }

    public async Task<List<SearchAutocompleteDto>> Handle(SearchAutocompleteQuery request, CancellationToken cancellationToken)
    {
        return await _searchAutocompleteRepository.SearchAutocompleteAsync(request.Keyword ?? "", cancellationToken);
    }
}
