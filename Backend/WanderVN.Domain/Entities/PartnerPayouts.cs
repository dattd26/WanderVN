using System;

namespace WanderVN.Domain.Entities;

public partial class PartnerPayouts
{
    public int Id { get; set; }

    public int PartnerId { get; set; }

    public int BookingId { get; set; }

    public decimal GrossAmount { get; set; }

    public decimal CommissionAmount { get; set; }

    public decimal NetAmount { get; set; }

    public string Status { get; set; } = "Pending"; // Pending, Approved, Paid, Rejected

    public string PayoutMethod { get; set; } = "Manual"; // BankTransfer, Manual

    public DateTimeOffset? PaidAt { get; set; }

    public string? TransactionReference { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual Users Partner { get; set; } = null!;

    public virtual Bookings Booking { get; set; } = null!;
}
