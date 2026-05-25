USE [WanderVN]
GO

/****** Object:  Table [dbo].[PartnerPayouts] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PartnerPayouts')
BEGIN
    CREATE TABLE [dbo].[PartnerPayouts](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [PartnerId] [int] NOT NULL,
        [BookingId] [int] NOT NULL,
        [GrossAmount] [decimal](18, 2) NOT NULL,
        [CommissionAmount] [decimal](18, 2) NOT NULL,
        [NetAmount] [decimal](18, 2) NOT NULL,
        [Status] [nvarchar](50) NOT NULL DEFAULT ('Pending'), -- Pending, Approved, Paid, Rejected
        [PayoutMethod] [nvarchar](50) NOT NULL DEFAULT ('Manual'), -- BankTransfer, Manual
        [PaidAt] [datetimeoffset](7) NULL,
        [TransactionReference] [nvarchar](100) NULL,
        [CreatedAt] [datetimeoffset](7) NOT NULL DEFAULT (sysdatetimeoffset()),
    PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    ));

    ALTER TABLE [dbo].[PartnerPayouts] WITH CHECK ADD FOREIGN KEY([PartnerId])
    REFERENCES [dbo].[Users] ([Id]);

    ALTER TABLE [dbo].[PartnerPayouts] WITH CHECK ADD FOREIGN KEY([BookingId])
    REFERENCES [dbo].[Bookings] ([Id]);
END
GO
