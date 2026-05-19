using System.Collections.Generic;
using MediatR;

namespace WanderVN.Application.Features.PropertyTypes.Queries.GetPropertyTypes;

/// <summary>
/// Query yêu cầu lấy toàn bộ danh sách Loại hình lưu trú khả dụng.
/// </summary>
public class GetPropertyTypesQuery : IRequest<List<GetPropertyTypesDto>>
{
}
