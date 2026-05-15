
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
    IconName VARCHAR(50) -- Ví dụ: 'wifi', 'pool', 'parking' (map với Lucide/FontAwesome)
);

---------------------------------------------------------
-- 3. HOTELS & ROOMS
---------------------------------------------------------
CREATE TABLE Hotels (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LocationId INT FOREIGN KEY REFERENCES Locations(Id),
    Name NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500),
    StarRating INT CHECK (StarRating BETWEEN 1 AND 5),
    Description NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Bảng trung gian quản lý tiện ích khách sạn (N-N)
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

---------------------------------------------------------
-- 4. MEDIA GALLERY 
---------------------------------------------------------
CREATE TABLE HotelImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    HotelId INT FOREIGN KEY REFERENCES Hotels(Id),
    ImageUrl NVARCHAR(500) NOT NULL,
    IsPrimary BIT DEFAULT 0,
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE RoomTypeImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RoomTypeId INT FOREIGN KEY REFERENCES RoomTypes(Id),
    ImageUrl NVARCHAR(500) NOT NULL,
    IsPrimary BIT DEFAULT 0
);

---------------------------------------------------------
-- 5. TRANSPORTATION & EXPERIENCES
---------------------------------------------------------
CREATE TABLE Airlines (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    LogoUrl NVARCHAR(500)
);

CREATE TABLE Airports (
    Id INT PRIMARY KEY IDENTITY(1,1),
    IataCode VARCHAR(5) UNIQUE NOT NULL,
    Name NVARCHAR(200),
    City NVARCHAR(100)
);

CREATE TABLE Flights (
    Id INT PRIMARY KEY IDENTITY(1,1),
    AirlineId INT FOREIGN KEY REFERENCES Airlines(Id),
    FlightNumber VARCHAR(20) NOT NULL,
    DepAirportId INT FOREIGN KEY REFERENCES Airports(Id),
    ArrAirportId INT FOREIGN KEY REFERENCES Airports(Id),
    DepTime DATETIME NOT NULL,
    ArrTime DATETIME NOT NULL,
    Price DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'OnTime'
);

CREATE TABLE Tours (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LocationId INT FOREIGN KEY REFERENCES Locations(Id),
    Name NVARCHAR(200) NOT NULL,
    DurationDays INT,
    Price DECIMAL(18, 2) NOT NULL,
    Description NVARCHAR(MAX)
);

CREATE TABLE TourImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TourId INT FOREIGN KEY REFERENCES Tours(Id),
    ImageUrl NVARCHAR(500) NOT NULL,
    IsPrimary BIT DEFAULT 0
);

---------------------------------------------------------
-- 6. BOOKING & TRANSACTIONS
---------------------------------------------------------
CREATE TABLE Bookings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    BookingCode VARCHAR(20) UNIQUE NOT NULL,
    ServiceType NVARCHAR(20) NOT NULL, -- Hotel, Flight, Tour
    TotalPrice DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending',
    PaymentStatus NVARCHAR(50) DEFAULT 'Unpaid',
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE BookingHotels (
    Id INT PRIMARY KEY IDENTITY(1,1),
    BookingId INT FOREIGN KEY REFERENCES Bookings(Id),
    RoomId INT FOREIGN KEY REFERENCES Rooms(Id),
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL
);

CREATE TABLE BookingFlights (
    Id INT PRIMARY KEY IDENTITY(1,1),
    BookingId INT FOREIGN KEY REFERENCES Bookings(Id),
    FlightId INT FOREIGN KEY REFERENCES Flights(Id),
    PassengerName NVARCHAR(100),
    PassportNumber VARCHAR(50),
    SeatNumber VARCHAR(10)
);

CREATE TABLE Payments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    BookingId INT FOREIGN KEY REFERENCES Bookings(Id),
    Amount DECIMAL(18, 2) NOT NULL,
    Method NVARCHAR(50), -- VNPay, MoMo
    TransactionId VARCHAR(100),
    PaymentDate DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

---------------------------------------------------------
-- 7. Tương tác người dùng & AI LOGS
---------------------------------------------------------
CREATE TABLE Wishlists (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    ServiceId INT, 
    ServiceType NVARCHAR(20)
);

CREATE TABLE ChatLogs (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    MessageText NVARCHAR(MAX),
    IsFromBot BIT DEFAULT 0,
    SentAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

GO

---------------------------------------------------------
-- 8. BUSINESS LOGIC (FUNCTIONS & PROCEDURES)
---------------------------------------------------------

-- Hàm kiểm tra phòng trống
CREATE OR ALTER FUNCTION fn_GetAvailableRoomCount 
(
    @RoomTypeId INT,
    @CheckIn DATE,
    @CheckOut DATE
)
RETURNS INT
AS
BEGIN
    DECLARE @TotalRooms INT;
    DECLARE @BookedRooms INT;
    SELECT @TotalRooms = TotalRooms FROM RoomTypes WHERE Id = @RoomTypeId;

    SELECT @BookedRooms = COUNT(bd.Id)
    FROM BookingHotels bd
    JOIN Rooms r ON bd.RoomId = r.Id
    JOIN Bookings b ON bd.BookingId = b.Id
    WHERE r.RoomTypeId = @RoomTypeId
      AND b.Status <> 'Cancelled'
      AND NOT (bd.CheckOutDate <= @CheckIn OR bd.CheckInDate >= @CheckOut);

    RETURN ISNULL(@TotalRooms, 0) - ISNULL(@BookedRooms, 0);
END;
GO

-- SP Tìm kiếm khách sạn (Kèm ảnh chính)
CREATE OR ALTER PROCEDURE sp_SearchHotels
    @LocationId INT,
    @CheckIn DATE,
    @CheckOut DATE,
    @Capacity INT
AS
BEGIN
    SELECT DISTINCT h.*, l.Name AS LocationName, 
           img.ImageUrl AS PrimaryImage,
           (SELECT MIN(BasePrice) FROM RoomTypes WHERE HotelId = h.Id) AS MinPrice
    FROM Hotels h
    JOIN Locations l ON h.LocationId = l.Id
    JOIN RoomTypes rt ON rt.HotelId = h.Id
    LEFT JOIN HotelImages img ON h.Id = img.HotelId AND img.IsPrimary = 1
    WHERE h.LocationId = @LocationId
      AND h.IsActive = 1
      AND rt.Capacity >= @Capacity
      AND dbo.fn_GetAvailableRoomCount(rt.Id, @CheckIn, @CheckOut) > 0;
END;
GO

-- SP Tạo đơn đặt phòng (Transaction & Overbooking)
CREATE OR ALTER PROCEDURE sp_CreateHotelBooking
    @UserId INT,
    @RoomTypeId INT,
    @CheckIn DATE,
    @CheckOut DATE,
    @TotalPrice DECIMAL(18,2),
    @BookingCode VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF dbo.fn_GetAvailableRoomCount(@RoomTypeId, @CheckIn, @CheckOut) <= 0
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Phòng đã hết!', 16, 1);
            RETURN;
        END

        DECLARE @RoomId INT;
        SELECT TOP 1 @RoomId = r.Id FROM Rooms r
        WHERE r.RoomTypeId = @RoomTypeId 
          AND r.Id NOT IN (
              SELECT bd.RoomId FROM BookingHotels bd
              WHERE NOT (bd.CheckOutDate <= @CheckIn OR bd.CheckInDate >= @CheckOut)
          );

        INSERT INTO Bookings (UserId, BookingCode, ServiceType, TotalPrice, Status)
        VALUES (@UserId, @BookingCode, 'Hotel', @TotalPrice, 'Pending');
        
        DECLARE @BookingId INT = SCOPE_IDENTITY();

        INSERT INTO BookingHotels (BookingId, RoomId, CheckInDate, CheckOutDate)
        VALUES (@BookingId, @RoomId, @CheckIn, @CheckOut);

        COMMIT TRANSACTION;
        SELECT @BookingId AS NewBookingId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

---------------------------------------------------------
-- 9. PERFORMANCE INDEXING
---------------------------------------------------------
CREATE INDEX IX_Hotels_Location ON Hotels(LocationId);
CREATE INDEX IX_HotelImages_Primary ON HotelImages(HotelId) WHERE IsPrimary = 1;
CREATE INDEX IX_RoomTypes_Hotel ON RoomTypes(HotelId);
CREATE INDEX IX_Booking_User ON Bookings(UserId);
CREATE INDEX IX_Booking_Code ON Bookings(BookingCode);
GO