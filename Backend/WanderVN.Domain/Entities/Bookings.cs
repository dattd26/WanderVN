using System;
using System.Collections.Generic;
using WanderVN.Domain.Enums;

namespace WanderVN.Domain.Entities;

public partial class Bookings
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string BookingCode { get; set; } = null!;

    public BookingServiceType ServiceType { get; set; }

    public decimal TotalPrice { get; set; }

    public decimal? DuffelAmountVnd { get; set; }

    public decimal? MarkupAmountVnd { get; set; }

    public decimal? PaymentFeeVnd { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public BookingPaymentStatus PaymentStatus { get; set; } = BookingPaymentStatus.Unpaid;

    public DateTimeOffset? CreatedAt { get; set; }

    public string? Email { get; set; }

    public string? CustomerName { get; set; }

    public string? CustomerPhone { get; set; }

    public DateTimeOffset? CheckedOutAt { get; set; }

    public virtual ICollection<BookingFlights> BookingFlights { get; set; } = new List<BookingFlights>();

    public virtual ICollection<BookingHotels> BookingHotels { get; set; } = new List<BookingHotels>();

    public virtual ICollection<Payments> Payments { get; set; } = new List<Payments>();

    public virtual Users? User { get; set; }

    public virtual ICollection<PartnerPayouts> PartnerPayouts { get; set; } = new List<PartnerPayouts>();
}
