USE WanderVN;
GO

-- Add CheckedOutAt to Bookings
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND name = 'CheckedOutAt')
BEGIN
    ALTER TABLE Bookings ADD CheckedOutAt DATETIMEOFFSET NULL;
END
GO

-- Add PayoutGracePeriodHours to SystemSettings if not exists
IF NOT EXISTS (SELECT * FROM SystemSettings WHERE [Key] = 'PayoutGracePeriodHours')
BEGIN
    INSERT INTO SystemSettings ([Key], [Value], [Description])
    VALUES ('PayoutGracePeriodHours', '24', N'Thời gian bảo lưu trước khi tạo Payout tự động sau khi khách Checkout (tính theo giờ)');
END
GO

-- Chuyển đổi Status từ string sang int trong PartnerPayouts
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PartnerPayouts]') AND name = 'Status')
BEGIN
    IF EXISTS (
        SELECT * FROM sys.columns c 
        JOIN sys.types t ON c.user_type_id = t.user_type_id 
        WHERE c.object_id = OBJECT_ID(N'[dbo].[PartnerPayouts]') 
          AND c.name = 'Status' 
          AND t.name IN ('nvarchar', 'varchar', 'char', 'nchar')
    )
    BEGIN
        ALTER TABLE PartnerPayouts ADD StatusInt INT NOT NULL DEFAULT 0;
        
        -- Run update
        EXEC('
            UPDATE PartnerPayouts SET StatusInt = 
                CASE Status 
                    WHEN ''Pending'' THEN 0
                    WHEN ''Processing'' THEN 1 
                    WHEN ''Paid'' THEN 2
                    WHEN ''Failed'' THEN 3
                    WHEN ''Cancelled'' THEN 4
                    WHEN ''Approved'' THEN 1
                    WHEN ''Rejected'' THEN 4
                    ELSE 0
                END
        ');
        
        DECLARE @ConstraintName NVARCHAR(256);
        SELECT @ConstraintName = d.name
        FROM sys.default_constraints d
        INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
        WHERE d.parent_object_id = OBJECT_ID(N'[dbo].[PartnerPayouts]')
          AND c.name = 'Status';
          
        IF @ConstraintName IS NOT NULL
        BEGIN
            EXEC('ALTER TABLE PartnerPayouts DROP CONSTRAINT ' + @ConstraintName);
        END

        ALTER TABLE PartnerPayouts DROP COLUMN Status;
        EXEC sp_rename 'PartnerPayouts.StatusInt', 'Status', 'COLUMN';
    END
END
GO
