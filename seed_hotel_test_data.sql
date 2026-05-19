-- ==========================================================
-- SCRIPT GIẢ LẬP DỮ LIỆU ĐỐI TÁC VÀ KHÁCH SẠN CHO WANDERVN
-- Phục vụ: Kiểm thử API Tìm kiếm Khách sạn ở môi trường Dev
-- ==========================================================
SET QUOTED_IDENTIFIER ON;
GO

USE [WanderVN];
GO

-- 1. TẠO ROLE ĐỐI TÁC (NẾU CHƯA CÓ)
DECLARE @PartnerRoleId INT;
SELECT @PartnerRoleId = Id FROM Roles WHERE Name = 'Partner';
IF @PartnerRoleId IS NULL
BEGIN
    INSERT INTO Roles (Name) VALUES ('Partner');
    SET @PartnerRoleId = SCOPE_IDENTITY();
END

-- 2. TẠO USER ĐỐI TÁC DEMO
DECLARE @PartnerUserId INT;
SELECT @PartnerUserId = Id FROM Users WHERE Email = 'partner_demo@wandervn.com';
IF @PartnerUserId IS NULL
BEGIN
    INSERT INTO Users (RoleId, Email, PasswordHash, FullName, PhoneNumber, IsActive, CreatedAt)
    VALUES (@PartnerRoleId, 'partner_demo@wandervn.com', 'hashed_pwd_123', N'Nguyễn Văn Đối Tác', '0901234567', 1, SYSDATETIMEOFFSET());
    SET @PartnerUserId = SCOPE_IDENTITY();
END

-- 3. TẠO DỮ LIỆU ĐỊA ĐIỂM (LOCATIONS)
DECLARE @HanoiId INT, @DanangId INT;

SELECT @HanoiId = Id FROM Locations WHERE Name = N'Hà Nội';
IF @HanoiId IS NULL
BEGIN
    INSERT INTO Locations (Name, Description, ImageUrl) 
    VALUES (N'Hà Nội', N'Thủ đô ngàn năm văn hiến', 'https://example.com/hanoi.jpg');
    SET @HanoiId = SCOPE_IDENTITY();
END

SELECT @DanangId = Id FROM Locations WHERE Name = N'Đà Nẵng';
IF @DanangId IS NULL
BEGIN
    INSERT INTO Locations (Name, Description, ImageUrl) 
    VALUES (N'Đà Nẵng', N'Thành phố đáng sống', 'https://example.com/danang.jpg');
    SET @DanangId = SCOPE_IDENTITY();
END

-- 4. TẠO KHÁCH SẠN (HOTELS) & HẠNG PHÒNG
DECLARE @Hotel1Id INT, @Hotel2Id INT;

-- Khách sạn 1 (Hà Nội)
SELECT @Hotel1Id = Id FROM Hotels WHERE Name = N'WanderVN Luxury Hotel Hà Nội';
IF @Hotel1Id IS NULL
BEGIN
    INSERT INTO Hotels (LocationId, Name, Address, StarRating, Description, IsActive, CreatedAt, OwnerId)
    VALUES (@HanoiId, N'WanderVN Luxury Hotel Hà Nội', N'01 Tràng Tiền, Hoàn Kiếm', 5, N'Khách sạn 5 sao sang trọng giữa lòng thủ đô', 1, SYSDATETIMEOFFSET(), @PartnerUserId);
    SET @Hotel1Id = SCOPE_IDENTITY();

    -- Hình ảnh Khách sạn
    INSERT INTO HotelImages (HotelId, ImageUrl, IsPrimary) VALUES (@Hotel1Id, 'https://example.com/hotel1_1.jpg', 1);
    
    -- Hạng phòng
    DECLARE @Rt1 INT;
    INSERT INTO RoomTypes (HotelId, Name, BasePrice, Capacity, TotalRooms)
    VALUES (@Hotel1Id, N'Standard Double Room', 1500000, 2, 2);
    SET @Rt1 = SCOPE_IDENTITY();
    
    -- Phòng vật lý (Physical Rooms)
    INSERT INTO Rooms (RoomTypeId, RoomNumber, Status) VALUES (@Rt1, '101', 'Available');
    INSERT INTO Rooms (RoomTypeId, RoomNumber, Status) VALUES (@Rt1, '102', 'Available');
END

-- Khách sạn 2 (Đà Nẵng)
SELECT @Hotel2Id = Id FROM Hotels WHERE Name = N'WanderVN Beach Resort Đà Nẵng';
IF @Hotel2Id IS NULL
BEGIN
    INSERT INTO Hotels (LocationId, Name, Address, StarRating, Description, IsActive, CreatedAt, OwnerId)
    VALUES (@DanangId, N'WanderVN Beach Resort Đà Nẵng', N'100 Võ Nguyên Giáp, Sơn Trà', 4, N'Resort view biển tuyệt đẹp', 1, SYSDATETIMEOFFSET(), @PartnerUserId);
    SET @Hotel2Id = SCOPE_IDENTITY();

    -- Hình ảnh Khách sạn
    INSERT INTO HotelImages (HotelId, ImageUrl, IsPrimary) VALUES (@Hotel2Id, 'https://example.com/hotel2_1.jpg', 1);
    
    -- Hạng phòng
    DECLARE @Rt2 INT;
    INSERT INTO RoomTypes (HotelId, Name, BasePrice, Capacity, TotalRooms)
    VALUES (@Hotel2Id, N'Ocean View Suite', 3000000, 4, 1);
    SET @Rt2 = SCOPE_IDENTITY();
    
    -- Phòng vật lý
    INSERT INTO Rooms (RoomTypeId, RoomNumber, Status) VALUES (@Rt2, 'A100', 'Available');
END

PRINT 'Dữ liệu mẫu khách sạn (Partner, Locations, Hotels, RoomTypes, Rooms) đã được tạo thành công!';
GO
