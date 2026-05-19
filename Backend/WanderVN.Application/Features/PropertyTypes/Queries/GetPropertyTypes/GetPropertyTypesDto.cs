namespace WanderVN.Application.Features.PropertyTypes.Queries.GetPropertyTypes;

/// <summary>
/// DTO đại diện cho thông tin Loại hình lưu trú trả về cho client.
/// </summary>
public class GetPropertyTypesDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
