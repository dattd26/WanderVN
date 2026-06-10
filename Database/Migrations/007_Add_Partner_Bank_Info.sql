-- Migration: Add bank account details to Users table for Partner payouts
ALTER TABLE Users
  ADD BankName NVARCHAR(100) NULL,
      BankAccountNumber VARCHAR(50) NULL,
      BankAccountName NVARCHAR(255) NULL;
GO
