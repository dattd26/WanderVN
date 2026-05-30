USE WanderVN;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SystemSettings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SystemSettings](
        [Key] [nvarchar](50) NOT NULL,
        [Value] [nvarchar](255) NOT NULL,
        [Description] [nvarchar](500) NULL,
        CONSTRAINT [PK_SystemSettings] PRIMARY KEY CLUSTERED 
        (
            [Key] ASC
        )
    );

    -- Insert default values
    INSERT INTO [dbo].[SystemSettings] ([Key], [Value], [Description])
    VALUES ('CommissionFee', '10', N'Tỷ lệ phần trăm phí hoa hồng hệ thống (Ví dụ: 10 cho 10%)');
END
GO
