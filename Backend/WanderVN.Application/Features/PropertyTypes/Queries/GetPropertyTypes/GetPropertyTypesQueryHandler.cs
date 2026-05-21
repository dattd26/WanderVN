using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.PropertyTypes.Queries.GetPropertyTypes;

/// <summary>
/// Handler xử lý nghiệp vụ lấy danh sách Loại hình lưu trú ở tầng Application.
/// </summary>
public class GetPropertyTypesQueryHandler : IRequestHandler<GetPropertyTypesQuery, List<GetPropertyTypesDto>>
{
    private readonly IPropertyTypeRepository _propertyTypeRepository;

    public GetPropertyTypesQueryHandler(IPropertyTypeRepository propertyTypeRepository)
    {
        _propertyTypeRepository = propertyTypeRepository;
    }

    public async Task<List<GetPropertyTypesDto>> Handle(GetPropertyTypesQuery request, CancellationToken cancellationToken)
    {
        return await _propertyTypeRepository.GetPropertyTypesAsync(cancellationToken);
    }
}
