using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Roles
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Users> Users { get; set; } = new List<Users>();
}
