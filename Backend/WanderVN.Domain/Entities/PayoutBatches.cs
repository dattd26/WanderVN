using System;
using System.Collections.Generic;

namespace WanderVN.Domain.Entities;

public enum BatchStatus
{
    Processing = 0,
    Paid = 1,
    Cancelled = 2
}

public class PayoutBatches
{
    public int Id { get; set; }
    
    public string BatchCode { get; set; } = null!;
    
    public int PartnerId { get; set; }
    
    public decimal TotalGross { get; set; }
    
    public decimal TotalCommission { get; set; }
    
    public decimal TotalNet { get; set; }
    
    public int BookingCount { get; set; }
    
    public BatchStatus Status { get; set; } = BatchStatus.Processing;
    
    public string? Note { get; set; }
    
    public DateTimeOffset? PaidAt { get; set; }
    
    public string? TransactionReference { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    public virtual Users Partner { get; set; } = null!;
    
    public virtual ICollection<PartnerPayouts> Payouts { get; set; } = new List<PartnerPayouts>();
}
