using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.Features.PropertyTypes.Queries.GetPropertyTypes;

namespace WanderVN.Application.Common.Interfaces;

/// <summary>
/// Giao diện repository/query service truy xuất Loại hình lưu trú.
/// </summary>
public interface IPropertyTypeRepository
{
    /// <summary>
    /// Lấy danh sách loại hình lưu trú map sang DTO.
    /// </summary>
    Task<List<GetPropertyTypesDto>> GetPropertyTypesAsync(CancellationToken cancellationToken);
}
