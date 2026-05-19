using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

/// <summary>
/// Đại diện cho danh mục Loại hình lưu trú (Khách sạn, Resort, Villa, Homestay...)
/// </summary>
public partial class PropertyTypes
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Code { get; set; } = null!;

    public virtual ICollection<Hotels> Hotels { get; set; } = new List<Hotels>();
}
