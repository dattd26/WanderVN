using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Locations
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    // Loại địa điểm (ví dụ: Province, District, Attraction)
    public string Type { get; set; } = null!;

    // ID của địa điểm cha (ví dụ: Huyện thuộc Tỉnh, Xã thuộc Huyện)
    public int? ParentId { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    // Tọa độ địa lý dùng để center bản đồ OpenStreetMap khi user search địa điểm này
    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    // Mối quan hệ tự liên kết (Địa điểm cha)
    public virtual Locations? Parent { get; set; }

    // Danh sách các địa điểm con thuộc địa điểm này
    public virtual ICollection<Locations> InverseParent { get; set; } = new List<Locations>();

    public virtual ICollection<Hotels> Hotels { get; set; } = new List<Hotels>();
}
