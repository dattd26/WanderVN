-- SQL Migration để thêm các trường phục vụ xét duyệt Partner (Status, RejectReason, ApprovedAt) vào bảng Users

ALTER TABLE [dbo].[Users]
ADD [Status] INT NOT NULL CONSTRAINT [DF_Users_Status] DEFAULT ((1));
GO

ALTER TABLE [dbo].[Users]
ADD [RejectReason] NVARCHAR(500) NULL;
GO

ALTER TABLE [dbo].[Users]
ADD [ApprovedAt] DATETIMEOFFSET(7) NULL;
GO

-- (Tuỳ chọn) Nếu bạn muốn cập nhật Status = 0 (Pending) cho những Partner hiện tại đang bị IsActive = 0
-- UPDATE [dbo].[Users] 
-- SET [Status] = 0 
-- WHERE [RoleId] = (SELECT Id FROM [dbo].[Roles] WHERE [Name] = 'Partner') AND [IsActive] = 0;
-- GO
