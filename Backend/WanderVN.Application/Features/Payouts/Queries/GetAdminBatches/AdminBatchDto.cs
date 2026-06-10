using System;
using System.Collections.Generic;

namespace WanderVN.Application.Features.Payouts.Queries.GetAdminBatches;

public class AdminBatchDto
{
    public int Id { get; set; }
    public string BatchCode { get; set; } = null!;
    
    public int PartnerId { get; set; }
    public string? PartnerName { get; set; }
    public string? PartnerEmail { get; set; }
    
    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankAccountName { get; set; }
    public string? BankBin { get; set; }
    
    public decimal TotalGross { get; set; }
    public decimal TotalCommission { get; set; }
    public decimal TotalNet { get; set; }
    public int BookingCount { get; set; }
    
    public string Status { get; set; } = null!;
    public string? Note { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public string? TransactionReference { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    public List<BatchPayoutItemDto> Payouts { get; set; } = new();
}

public class BatchPayoutItemDto
{
    public int Id { get; set; }
    public string BookingCode { get; set; } = null!;
    public string ServiceType { get; set; } = null!;
    public decimal GrossAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string Status { get; set; } = null!;
}
