-- Migration: Add BankBin column to Users table for VietQR integration
ALTER TABLE Users
  ADD BankBin VARCHAR(10) NULL;
GO
