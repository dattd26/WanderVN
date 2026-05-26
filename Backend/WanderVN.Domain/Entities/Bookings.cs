using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Bookings
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string BookingCode { get; set; } = null!;

    public string ServiceType { get; set; } = null!;

    public decimal TotalPrice { get; set; }

    public string? Status { get; set; }

    public string? PaymentStatus { get; set; }

    public DateTimeOffset? CreatedAt { get; set; }

    public virtual ICollection<BookingFlights> BookingFlights { get; set; } = new List<BookingFlights>();

    public virtual ICollection<BookingHotels> BookingHotels { get; set; } = new List<BookingHotels>();

    public virtual ICollection<Payments> Payments { get; set; } = new List<Payments>();

    public virtual Users? User { get; set; }

    public virtual ICollection<PartnerPayouts> PartnerPayouts { get; set; } = new List<PartnerPayouts>();
}
