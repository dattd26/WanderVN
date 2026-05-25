using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class HotelImages
{
    public int Id { get; set; }

    public int? HotelId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public bool? IsPrimary { get; set; }

    public DateTimeOffset? CreatedAt { get; set; }

    // Cloudinary public_id — dùng để xóa/transform ảnh sau này
    public string? PublicId { get; set; }

    public virtual Hotels? Hotel { get; set; }
}
