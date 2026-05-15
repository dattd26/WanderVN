using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public partial class Payments
{
    public int Id { get; set; }

    public int? BookingId { get; set; }

    public decimal Amount { get; set; }

    public string? Method { get; set; }

    public string? TransactionId { get; set; }

    public DateTimeOffset? PaymentDate { get; set; }

    public virtual Bookings? Booking { get; set; }
}
