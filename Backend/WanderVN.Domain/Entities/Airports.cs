using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace WanderVN.Domain.Entities;

public partial class Airports
{
    public int Id { get; set; }

    public string IataCode { get; set; } = null!;

    public string? Name { get; set; }

    public string? City { get; set; }

    [NotMapped]
    public virtual ICollection<Flights> FlightsArrAirport { get; set; } = new List<Flights>();
    [NotMapped]
    public virtual ICollection<Flights> FlightsDepAirport { get; set; } = new List<Flights>();
}
