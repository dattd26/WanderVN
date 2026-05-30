using System;

namespace WanderVN.Domain.Entities;

public enum PayoutStatus
{
    Pending = 0,
    Processing = 1,
    Paid = 2,
    Failed = 3,
    Cancelled = 4
}

public partial class PartnerPayouts
{
    public int Id { get; set; }

    public int PartnerId { get; set; }

    public int BookingId { get; set; }

    public decimal GrossAmount { get; set; }

    public decimal CommissionAmount { get; set; }

    public decimal NetAmount { get; set; }

    public PayoutStatus Status { get; set; } = PayoutStatus.Pending; // Pending, Processing, Paid, Failed, Cancelled

    public string PayoutMethod { get; set; } = "Manual"; // BankTransfer, Manual

    public DateTimeOffset? PaidAt { get; set; }

    public string? TransactionReference { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual Users Partner { get; set; } = null!;

    public virtual Bookings Booking { get; set; } = null!;
}
