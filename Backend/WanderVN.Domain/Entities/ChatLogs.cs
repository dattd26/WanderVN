using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class ChatLogs
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string? MessageText { get; set; }

    public bool? IsFromBot { get; set; }

    public DateTimeOffset? SentAt { get; set; }

    public virtual Users? User { get; set; }
}
