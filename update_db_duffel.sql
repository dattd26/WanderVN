
-- =========================================================================
-- PHẦN 2: LOẠI BỎ HOÀN TOÀN CÁC BẢNG LIÊN QUAN ĐẾN ĐẶT TOUR
-- =========================================================================

-- 3. Xóa bảng TourImages trước (để tự động hủy khóa ngoại tham chiếu tới bảng Tours)
IF OBJECT_ID(N'[dbo].[TourImages]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[TourImages];
    PRINT 'Đã xóa bảng TourImages thành công khỏi cơ sở dữ liệu.';
END
ELSE
BEGIN
    PRINT 'Bảng TourImages không tồn tại hoặc đã được xóa trước đó.';
END;
GO

-- 4. Xóa bảng Tours sau khi đã xóa hết các tham chiếu phụ thuộc
IF OBJECT_ID(N'[dbo].[Tours]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[Tours];
    PRINT 'Đã xóa bảng Tours thành công khỏi cơ sở dữ liệu.';
END
ELSE
BEGIN
    PRINT 'Bảng Tours không tồn tại hoặc đã được xóa trước đó.';
END;
GO
