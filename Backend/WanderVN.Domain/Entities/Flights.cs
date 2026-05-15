using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Flights
{
    public int Id { get; set; }

    public int? AirlineId { get; set; }

    public string FlightNumber { get; set; } = null!;

    public int? DepAirportId { get; set; }

    public int? ArrAirportId { get; set; }

    public DateTime DepTime { get; set; }

    public DateTime ArrTime { get; set; }

    public decimal Price { get; set; }

    public string? Status { get; set; }

    public virtual Airlines? Airline { get; set; }

    public virtual Airports? ArrAirport { get; set; }

    public virtual ICollection<BookingFlights> BookingFlights { get; set; } = new List<BookingFlights>();

    public virtual Airports? DepAirport { get; set; }
}
