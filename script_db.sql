CREATE DATABASE WanderVN;
GO

USE WanderVN;
GO

---------------------------------------------------------
-- 1. IDENTITY & AUTHORIZATION
---------------------------------------------------------
CREATE TABLE Roles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RoleId INT FOREIGN KEY REFERENCES Roles(Id),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    FullName NVARCHAR(100),
    PhoneNumber VARCHAR(20),
    AvatarUrl NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET
);

---------------------------------------------------------
-- 2. GEOGRAPHY & MASTER DATA
---------------------------------------------------------
CREATE TABLE Locations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    ImageUrl NVARCHAR(500)
);

CREATE TABLE Amenities (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    IconName VARCHAR(50)
);

---------------------------------------------------------
-- 3. HOTELS & ROOMS
---------------------------------------------------------
CREATE TABLE Hotels (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LocationId INT FOREIGN KEY REFERENCES Locations(Id),
    OwnerId INT FOREIGN KEY REFERENCES Users(Id), -- Phân quyền sở hữu Partner
    Name NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500),
    StarRating INT CHECK (StarRating BETWEEN 1 AND 5),
    Description NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE HotelAmenities (
    HotelId INT FOREIGN KEY REFERENCES Hotels(Id),
    AmenityId INT FOREIGN KEY REFERENCES Amenities(Id),
    PRIMARY KEY (HotelId, AmenityId)
);

CREATE TABLE RoomTypes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    HotelId INT FOREIGN KEY REFERENCES Hotels(Id),
    Name NVARCHAR(100) NOT NULL,
    BasePrice DECIMAL(18, 2) NOT NULL,
    Capacity INT NOT NULL,
    TotalRooms INT NOT NULL
);

CREATE TABLE Rooms (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RoomTypeId INT FOREIGN KEY REFERENCES RoomTypes(Id),
    RoomNumber VARCHAR(20) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Available'
);
GO

---------------------------------------------------------
-- [CÁC BẢNG KHÁC GIỮ NGUYÊN...]
---------------------------------------------------------
-- 8. BUSINESS LOGIC (FUNCTIONS & PROCEDURES) - KÈM THEO PARTNER ENGINE MOD
---------------------------------------------------------

/* WanderVN Database Update Script - Partner Engine Mod
   Bổ sung liên kết sở hữu và cài đặt bộ Stored Procedures cho Partner.
*/

-- Kịch bản 1: Đăng ký tài khoản và khởi tạo cơ sở lưu trú (Transaction)
CREATE OR ALTER PROCEDURE sp_RegisterPartner
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(MAX),
    @FullName NVARCHAR(100),
    @PhoneNumber VARCHAR(20),
    @HotelName NVARCHAR(200),
    @Address NVARCHAR(500),
    @LocationId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @RoleId INT;
        SELECT @RoleId = Id FROM Roles WHERE Name = 'Partner';
        IF @RoleId IS NULL
        BEGIN
            INSERT INTO Roles (Name) VALUES ('Partner');
            SET @RoleId = SCOPE_IDENTITY();
        END

        INSERT INTO Users (RoleId, Email, PasswordHash, FullName, PhoneNumber, IsActive)
        VALUES (@RoleId, @Email, @PasswordHash, @FullName, @PhoneNumber, 1);
        
        DECLARE @UserId INT = SCOPE_IDENTITY();

        INSERT INTO Hotels (LocationId, Name, Address, IsActive, OwnerId)
        VALUES (@LocationId, @HotelName, @Address, 1, @UserId);

        COMMIT TRANSACTION;
        SELECT @UserId AS NewPartnerId, SCOPE_IDENTITY() AS NewHotelId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Kịch bản 2: Cập nhật thông tin và cấu hình giá loại phòng (Có Check quyền sở hữu)
CREATE OR ALTER PROCEDURE sp_Partner_UpdateRoomType
    @PartnerId INT,
    @RoomTypeId INT,
    @Name NVARCHAR(100),
    @BasePrice DECIMAL(18,2),
    @Capacity INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (
        SELECT 1 FROM RoomTypes rt
        JOIN Hotels h ON rt.HotelId = h.Id
        WHERE rt.Id = @RoomTypeId AND h.OwnerId = @PartnerId
    )
    BEGIN
        RAISERROR('403: Bạn không có quyền chỉnh sửa loại phòng này!', 16, 1);
        RETURN;
    END

    UPDATE RoomTypes
    SET Name = @Name,
        BasePrice = @BasePrice,
        Capacity = @Capacity
    WHERE Id = @RoomTypeId;
    
    SELECT @@ROWCOUNT AS UpdatedRows;
END;
GO

-- Kịch bản 3: Lưu hình ảnh đã upload từ Cloudinary vào Database
CREATE OR ALTER PROCEDURE sp_Partner_AddHotelImage
    @PartnerId INT,
    @HotelId INT,
    @ImageUrl NVARCHAR(500),
    @IsPrimary BIT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Hotels WHERE Id = @HotelId AND OwnerId = @PartnerId)
    BEGIN
        RAISERROR('403: Bạn không có quyền quản lý hình ảnh của khách sạn này!', 16, 1);
        RETURN;
    END

    IF @IsPrimary = 1
    BEGIN
        UPDATE HotelImages SET IsPrimary = 0 WHERE HotelId = @HotelId;
    END

    INSERT INTO HotelImages (HotelId, ImageUrl, IsPrimary)
    VALUES (@HotelId, @ImageUrl, @IsPrimary);
    
    SELECT SCOPE_IDENTITY() AS NewImageId;
END;
GO

-- Kịch bản 4: Xem báo cáo thống kê doanh thu và đơn đặt phòng (Dashboard Analytics)
CREATE OR ALTER PROCEDURE sp_Partner_GetDashboardStats
    @PartnerId INT,
    @HotelId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Hotels WHERE Id = @HotelId AND OwnerId = @PartnerId)
    BEGIN
        RAISERROR('403: Bạn không có quyền truy cập dữ liệu của khách sạn này!', 16, 1);
        RETURN;
    END

    SELECT 
        COUNT(CASE WHEN b.Status = 'Pending' THEN 1 END) AS TotalPendingBookings,
        COUNT(CASE WHEN b.Status = 'Confirmed' THEN 1 END) AS TotalConfirmedBookings,
        ISNULL(SUM(CASE WHEN b.PaymentStatus = 'Paid' THEN b.TotalPrice END), 0) AS TotalRevenue
    FROM Bookings b
    JOIN BookingHotels bh ON b.Id = bh.BookingId
    JOIN Rooms r ON bh.RoomId = r.Id
    JOIN RoomTypes rt ON r.RoomTypeId = rt.Id
    WHERE rt.HotelId = @HotelId;
END;
GO

---------------------------------------------------------
-- 9. PERFORMANCE INDEXING
---------------------------------------------------------
CREATE INDEX IX_Hotels_Owner ON Hotels(OwnerId);
CREATE INDEX IX_Hotels_Location ON Hotels(LocationId);
CREATE INDEX IX_RoomTypes_Hotel ON RoomTypes(HotelId);
GO