using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.PropertyTypes.Queries.GetPropertyTypes;

/// <summary>
/// Handler xử lý nghiệp vụ lấy danh sách Loại hình lưu trú ở tầng Application.
/// </summary>
public class GetPropertyTypesQueryHandler : IRequestHandler<GetPropertyTypesQuery, List<GetPropertyTypesDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPropertyTypesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetPropertyTypesDto>> Handle(GetPropertyTypesQuery request, CancellationToken cancellationToken)
    {
        // Truy vấn toàn bộ danh mục từ database và map sang DTO
        var propertyTypes = await _context.PropertyTypes
            .AsNoTracking()
            .Select(pt => new GetPropertyTypesDto
            {
                Id = pt.Id,
                Name = pt.Name,
                Code = pt.Code
            })
            .ToListAsync(cancellationToken);

        return propertyTypes;
    }
}
