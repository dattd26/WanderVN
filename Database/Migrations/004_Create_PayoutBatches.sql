-- Tạo bảng PayoutBatches
CREATE TABLE [dbo].[PayoutBatches] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [BatchCode] NVARCHAR(50) NOT NULL UNIQUE, -- Định dạng: PO-YYYYMMDD-XXX
    [PartnerId] INT NOT NULL,
    [TotalGross] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [TotalCommission] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [TotalNet] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [BookingCount] INT NOT NULL DEFAULT 0,
    [Status] INT NOT NULL DEFAULT 0, -- 0 = Processing, 1 = Paid, 2 = Cancelled
    [Note] NVARCHAR(500) NULL,
    [PaidAt] DATETIMEOFFSET NULL,
    [TransactionReference] NVARCHAR(200) NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [FK_PayoutBatches_Users_PartnerId] FOREIGN KEY ([PartnerId]) REFERENCES [dbo].[Users] ([Id])
);
GO

-- Thêm BatchId vào PartnerPayouts
ALTER TABLE [dbo].[PartnerPayouts]
ADD [BatchId] INT NULL;
GO

-- Tạo Foreign Key cho PartnerPayouts
ALTER TABLE [dbo].[PartnerPayouts]
ADD CONSTRAINT [FK_PartnerPayouts_PayoutBatches_BatchId] FOREIGN KEY ([BatchId]) REFERENCES [dbo].[PayoutBatches] ([Id]) ON DELETE SET NULL;
GO

-- Tạo các Index để tối ưu truy vấn
CREATE INDEX [IX_PayoutBatches_PartnerId] ON [dbo].[PayoutBatches] ([PartnerId]);
CREATE INDEX [IX_PartnerPayouts_BatchId] ON [dbo].[PartnerPayouts] ([BatchId]);
GO
