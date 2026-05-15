using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class BookingFlights
{
    public int Id { get; set; }

    public int? BookingId { get; set; }

    public int? FlightId { get; set; }

    public string? PassengerName { get; set; }

    public string? PassportNumber { get; set; }

    public string? SeatNumber { get; set; }

    public virtual Bookings? Booking { get; set; }

    public virtual Flights? Flight { get; set; }
}
