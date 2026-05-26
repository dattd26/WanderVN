USE [master]
GO
/****** Object:  Database [WanderVN]    Script Date: 18-May-26 6:31:12 PM ******/
-- Sửa đổi: Loại bỏ đường dẫn vật lý Windows để tương thích với Linux/Docker
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WanderVN')
BEGIN
    CREATE DATABASE [WanderVN] WITH CATALOG_COLLATION = DATABASE_DEFAULT;
END
GO
ALTER DATABASE [WanderVN] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [WanderVN].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [WanderVN] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [WanderVN] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [WanderVN] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [WanderVN] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [WanderVN] SET ARITHABORT OFF 
GO
ALTER DATABASE [WanderVN] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [WanderVN] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [WanderVN] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [WanderVN] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [WanderVN] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [WanderVN] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [WanderVN] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [WanderVN] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [WanderVN] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [WanderVN] SET  ENABLE_BROKER 
GO
ALTER DATABASE [WanderVN] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [WanderVN] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [WanderVN] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [WanderVN] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [WanderVN] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [WanderVN] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [WanderVN] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [WanderVN] SET RECOVERY FULL 
GO
ALTER DATABASE [WanderVN] SET  MULTI_USER 
GO
ALTER DATABASE [WanderVN] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [WanderVN] SET DB_CHAINING OFF 
GO
ALTER DATABASE [WanderVN] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [WanderVN] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [WanderVN] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [WanderVN] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'WanderVN', N'ON'
GO
ALTER DATABASE [WanderVN] SET QUERY_STORE = OFF
GO
USE [WanderVN]
GO
/****** Object:  UserDefinedFunction [dbo].[fn_GetAvailableRoomCount]    Script Date: 18-May-26 6:31:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER FUNCTION [dbo].[fn_GetAvailableRoomCount] 
(
    @RoomTypeId INT,
    @CheckIn DATE,
    @CheckOut DATE
)
RETURNS INT
AS
BEGIN
    -- Kiểm tra tính hợp lệ của ngày đặt phòng (Check-in phải trước Check-out)
    IF @CheckIn IS NULL OR @CheckOut IS NULL OR @CheckIn >= @CheckOut
    BEGIN
        RETURN 0;
    END;

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
/****** Object:  Table [dbo].[Airlines]    Script Date: 18-May-26 6:31:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Airlines](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [LogoUrl] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Airports]    Script Date: 18-May-26 6:31:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Airports](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [IataCode] [varchar](5) NOT NULL,
    [Name] [nvarchar](200) NULL,
    [City] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
),
UNIQUE NONCLUSTERED 
(
    [IataCode] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Amenities]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Amenities](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [IconName] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BookingFlights]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BookingFlights](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [BookingId] [int] NULL,
    [FlightId] [int] NULL,
    [PassengerName] [nvarchar](100) NULL,
    [PassportNumber] [varchar](50) NULL,
    [SeatNumber] [varchar](10) NULL,
    [DuffelOrderId] [varchar](100) NULL,
    [DuffelOfferId] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BookingHotels]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BookingHotels](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [BookingId] [int] NULL,
    [RoomId] [int] NULL,
    [CheckInDate] [date] NOT NULL,
    [CheckOutDate] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Bookings]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Bookings](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NULL,
    [BookingCode] [varchar](20) NOT NULL,
    [ServiceType] [nvarchar](20) NOT NULL,
    [TotalPrice] [decimal](18, 2) NOT NULL,
    [Status] [nvarchar](50) NULL,
    [PaymentStatus] [nvarchar](50) NULL,
    [CreatedAt] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
),
UNIQUE NONCLUSTERED 
(
    [BookingCode] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChatLogs]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChatLogs](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NULL,
    [MessageText] [nvarchar](max) NULL,
    [IsFromBot] [bit] NULL,
    [SentAt] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Flights]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Flights](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [AirlineId] [int] NULL,
    [FlightNumber] [varchar](20) NOT NULL,
    [DepAirportId] [int] NULL,
    [ArrAirportId] [int] NULL,
    [DepTime] [datetime] NOT NULL,
    [ArrTime] [datetime] NOT NULL,
    [Price] [decimal](18, 2) NOT NULL,
    [Status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HotelAmenities]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HotelAmenities](
    [HotelId] [int] NOT NULL,
    [AmenityId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [HotelId] ASC,
    [AmenityId] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HotelImages]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HotelImages](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [HotelId] [int] NULL,
    [ImageUrl] [nvarchar](500) NOT NULL,
    [IsPrimary] [bit] NULL,
    [CreatedAt] [datetimeoffset](7) NULL,
    [PublicId] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PropertyTypes]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PropertyTypes](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [Code] [varchar](50) NOT NULL UNIQUE,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Hotels]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Hotels](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [LocationId] [int] NULL,
    [Name] [nvarchar](200) NOT NULL,
    [Address] [nvarchar](500) NULL,
    [StarRating] [int] NULL,
    [Description] [nvarchar](max) NULL,
    [IsActive] [bit] NULL,
    [CreatedAt] [datetimeoffset](7) NULL,
    [OwnerId] [int] NULL,
    [PropertyTypeId] [int] NULL,
    [Latitude] [decimal](9, 6) NULL,
    [Longitude] [decimal](9, 6) NULL,
    [Status] [int] NOT NULL,                       -- 0=Pending, 1=Approved, 2=Rejected
    [CancellationPolicy] [nvarchar](20) NULL,      -- 'flexible' | 'moderate' | 'strict'
    [RejectReason] [nvarchar](500) NULL,
    [SubmittedAt] [datetimeoffset](7) NULL,
    [ApprovedAt] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED
(
    [Id] ASC
)) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Locations]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Locations](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [Type] [nvarchar](50) NOT NULL,
    [ParentId] [int] NULL,
    [Description] [nvarchar](max) NULL,
    [ImageUrl] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[Locations]  WITH CHECK ADD FOREIGN KEY([ParentId])
REFERENCES [dbo].[Locations] ([Id])
GO
/****** Object:  Table [dbo].[Payments]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Payments](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [BookingId] [int] NULL,
    [Amount] [decimal](18, 2) NOT NULL,
    [Method] [nvarchar](50) NULL,
    [TransactionId] [varchar](100) NULL,
    [PaymentDate] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Roles]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
),
UNIQUE NONCLUSTERED 
(
    [Name] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Rooms]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Rooms](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [HotelId] [int] NOT NULL, -- Liên kết trực tiếp với Hotels để tối ưu truy vấn hoặc hỗ trợ homestay
    [RoomTypeId] [int] NULL, -- Cho phép NULL đối với Homestay/Villa không cần loại phòng
    [RoomNumber] [varchar](20) NOT NULL,
    [Status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoomTypeImages]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoomTypeImages](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [RoomTypeId] [int] NULL,
    [ImageUrl] [nvarchar](500) NOT NULL,
    [IsPrimary] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoomTypes]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoomTypes](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [HotelId] [int] NULL,
    [Name] [nvarchar](100) NOT NULL,
    [BasePrice] [decimal](18, 2) NOT NULL,
    [Capacity] [int] NOT NULL,
    [TotalRooms] [int] NOT NULL,
    [Description] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[RatePlans] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RatePlans](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [RoomTypeId] [int] NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [PriceMultiplier] [decimal](18, 2) NOT NULL,
    [HasBreakfast] [bit] NOT NULL,
    [IsRefundable] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Users]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [RoleId] [int] NULL,
    [Email] [nvarchar](255) NOT NULL,
    [PasswordHash] [nvarchar](max) NOT NULL,
    [FullName] [nvarchar](100) NULL,
    [PhoneNumber] [varchar](20) NULL,
    [AvatarUrl] [nvarchar](500) NULL,
    [IsActive] [bit] NULL,
    [CreatedAt] [datetimeoffset](7) NULL,
    [UpdatedAt] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
),
UNIQUE NONCLUSTERED 
(
    [Email] ASC
)) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Wishlists]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Wishlists](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NULL,
    [ServiceId] [int] NULL,
    [ServiceType] [nvarchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Booking_Code]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_Booking_Code] ON [dbo].[Bookings]
(
    [BookingCode] ASC
)
GO
/****** Object:  Index [IX_Booking_User]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_Booking_User] ON [dbo].[Bookings]
(
    [UserId] ASC
)
GO
/****** Object:  Index [IX_HotelImages_Primary]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_HotelImages_Primary] ON [dbo].[HotelImages]
(
    [HotelId] ASC
)
WHERE ([IsPrimary]=(1))
GO
/****** Object:  Index [IX_Hotels_Location]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_Hotels_Location] ON [dbo].[Hotels]
(
    [LocationId] ASC
)
GO
/****** Object:  Index [IX_Hotels_Owner]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_Hotels_Owner] ON [dbo].[Hotels]
(
    [OwnerId] ASC
)
GO
/****** Object:  Index [IX_Hotels_Status]    Phục vụ admin queue + filter Status ******/
CREATE NONCLUSTERED INDEX [IX_Hotels_Status] ON [dbo].[Hotels]
(
    [Status] ASC
) INCLUDE ([OwnerId])
GO
/****** Object:  Index [IX_RoomTypes_Hotel]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_RoomTypes_Hotel] ON [dbo].[RoomTypes]
(
    [HotelId] ASC
)
GO
ALTER TABLE [dbo].[Bookings] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[Bookings] ADD  DEFAULT ('Unpaid') FOR [PaymentStatus]
GO
ALTER TABLE [dbo].[Bookings] ADD  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ChatLogs] ADD  DEFAULT ((0)) FOR [IsFromBot]
GO
ALTER TABLE [dbo].[ChatLogs] ADD  DEFAULT (sysdatetimeoffset()) FOR [SentAt]
GO
ALTER TABLE [dbo].[Flights] ADD  DEFAULT ('OnTime') FOR [Status]
GO
ALTER TABLE [dbo].[HotelImages] ADD  DEFAULT ((0)) FOR [IsPrimary]
GO
ALTER TABLE [dbo].[HotelImages] ADD  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Hotels] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Hotels] ADD  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Hotels] ADD  CONSTRAINT [DF_Hotels_Status] DEFAULT ((0)) FOR [Status]
GO
ALTER TABLE [dbo].[Payments] ADD  DEFAULT (sysdatetimeoffset()) FOR [PaymentDate]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT ('Available') FOR [Status]
GO
ALTER TABLE [dbo].[RoomTypeImages] ADD  DEFAULT ((0)) FOR [IsPrimary]
GO

ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[BookingFlights]  WITH CHECK ADD FOREIGN KEY([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
GO
ALTER TABLE [dbo].[BookingFlights]  WITH CHECK ADD FOREIGN KEY([FlightId])
REFERENCES [dbo].[Flights] ([Id])
GO
ALTER TABLE [dbo].[BookingHotels]  WITH CHECK ADD FOREIGN KEY([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
GO
ALTER TABLE [dbo].[BookingHotels]  WITH CHECK ADD FOREIGN KEY([RoomId])
REFERENCES [dbo].[Rooms] ([Id])
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[ChatLogs]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Flights]  WITH CHECK ADD FOREIGN KEY([AirlineId])
REFERENCES [dbo].[Airlines] ([Id])
GO
ALTER TABLE [dbo].[Flights]  WITH CHECK ADD FOREIGN KEY([ArrAirportId])
REFERENCES [dbo].[Airports] ([Id])
GO
ALTER TABLE [dbo].[Flights]  WITH CHECK ADD FOREIGN KEY([DepAirportId])
REFERENCES [dbo].[Airports] ([Id])
GO
ALTER TABLE [dbo].[HotelAmenities]  WITH CHECK ADD FOREIGN KEY([AmenityId])
REFERENCES [dbo].[Amenities] ([Id])
GO
ALTER TABLE [dbo].[HotelAmenities]  WITH CHECK ADD FOREIGN KEY([HotelId])
REFERENCES [dbo].[Hotels] ([Id])
GO
ALTER TABLE [dbo].[HotelImages]  WITH CHECK ADD FOREIGN KEY([HotelId])
REFERENCES [dbo].[Hotels] ([Id])
GO
ALTER TABLE [dbo].[Hotels]  WITH CHECK ADD FOREIGN KEY([LocationId])
REFERENCES [dbo].[Locations] ([Id])
GO
ALTER TABLE [dbo].[Hotels]  WITH CHECK ADD FOREIGN KEY([OwnerId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Hotels]  WITH CHECK ADD FOREIGN KEY([PropertyTypeId])
REFERENCES [dbo].[PropertyTypes] ([Id])
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD FOREIGN KEY([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD FOREIGN KEY([RoomTypeId])
REFERENCES [dbo].[RoomTypes] ([Id])
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD FOREIGN KEY([HotelId])
REFERENCES [dbo].[Hotels] ([Id])
GO
ALTER TABLE [dbo].[RoomTypeImages]  WITH CHECK ADD FOREIGN KEY([RoomTypeId])
REFERENCES [dbo].[RoomTypes] ([Id])
GO
ALTER TABLE [dbo].[RoomTypes]  WITH CHECK ADD FOREIGN KEY([HotelId])
REFERENCES [dbo].[Hotels] ([Id])
GO

ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([Id])
GO
ALTER TABLE [dbo].[Wishlists]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Hotels]  WITH CHECK ADD CHECK  (([StarRating]>=(1) AND [StarRating]<=(5)))
GO
ALTER TABLE [dbo].[Hotels]  WITH CHECK ADD  CONSTRAINT [CK_Hotels_Status] CHECK  (([Status] IN (0,1,2)))
GO
ALTER TABLE [dbo].[Hotels]  WITH CHECK ADD  CONSTRAINT [CK_Hotels_CancellationPolicy] CHECK  (([CancellationPolicy] IS NULL OR [CancellationPolicy] IN ('flexible','moderate','strict')))
GO

/****** Object:  StoredProcedure [dbo].[sp_Partner_UpdateRoomType] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
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

/****** Object:  StoredProcedure [dbo].[sp_Partner_AddHotelImage] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE sp_Partner_AddHotelImage
    @PartnerId  INT,
    @HotelId    INT,
    @ImageUrl   NVARCHAR(500),
    @PublicId   NVARCHAR(255) = NULL,
    @IsPrimary  BIT           = 0
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

    INSERT INTO HotelImages (HotelId, ImageUrl, PublicId, IsPrimary, CreatedAt)
    VALUES (@HotelId, @ImageUrl, @PublicId, @IsPrimary, SYSDATETIMEOFFSET());

    SELECT SCOPE_IDENTITY() AS NewImageId;
END;
GO

/****** Object:  StoredProcedure [dbo].[sp_Partner_SubmitHotel] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_Partner_SubmitHotel]
    @PartnerId           INT,
    @Name                NVARCHAR(200),
    @Address             NVARCHAR(500),
    @LocationId          INT          = NULL,
    @PropertyTypeId      INT          = NULL,
    @Description         NVARCHAR(MAX)= NULL,
    @StarRating          INT          = NULL,
    @Latitude            DECIMAL(9,6) = NULL,
    @Longitude           DECIMAL(9,6) = NULL,
    @CancellationPolicy  NVARCHAR(20) = NULL,
    @AmenityIdsCsv       NVARCHAR(MAX)= NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM Users u
        JOIN Roles r ON u.RoleId = r.Id
        WHERE u.Id = @PartnerId AND r.Name = 'Partner' AND u.IsActive = 1
    )
    BEGIN
        RAISERROR('403: Chỉ tài khoản Partner đang hoạt động mới được phép submit khách sạn!', 16, 1);
        RETURN;
    END

    IF @CancellationPolicy IS NOT NULL AND @CancellationPolicy NOT IN ('flexible','moderate','strict')
    BEGIN
        RAISERROR('400: CancellationPolicy phải là flexible | moderate | strict.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @Now DATETIMEOFFSET = SYSDATETIMEOFFSET();

        INSERT INTO Hotels
            (LocationId, OwnerId, PropertyTypeId, Name, Address, StarRating,
             Description, IsActive, CreatedAt, Latitude, Longitude,
             Status, CancellationPolicy, SubmittedAt)
        VALUES
            (@LocationId, @PartnerId, @PropertyTypeId, @Name, @Address, @StarRating,
             @Description, 1, @Now, @Latitude, @Longitude,
             0 /* Pending */, @CancellationPolicy, @Now);

        DECLARE @NewHotelId INT = SCOPE_IDENTITY();

        IF @AmenityIdsCsv IS NOT NULL AND LEN(@AmenityIdsCsv) > 0
        BEGIN
            INSERT INTO HotelAmenities (HotelId, AmenityId)
            SELECT @NewHotelId, TRY_CAST(LTRIM(RTRIM(value)) AS INT)
            FROM STRING_SPLIT(@AmenityIdsCsv, ',')
            WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL
              AND EXISTS (SELECT 1 FROM Amenities a WHERE a.Id = TRY_CAST(LTRIM(RTRIM(value)) AS INT));
        END

        COMMIT TRANSACTION;

        SELECT @NewHotelId AS NewHotelId, @Now AS SubmittedAt;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/****** Object:  StoredProcedure [dbo].[sp_Partner_ListMyHotels] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_Partner_ListMyHotels]
    @PartnerId INT,
    @Status    INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        h.Id,
        h.Name,
        h.Address,
        h.StarRating,
        h.Description,
        h.Status,
        h.CancellationPolicy,
        h.RejectReason,
        h.SubmittedAt,
        h.ApprovedAt,
        h.CreatedAt,
        l.Name AS LocationName,
        pt.Name AS PropertyTypeName,
        pt.Code AS PropertyTypeCode,
        (SELECT TOP 1 hi.ImageUrl
           FROM HotelImages hi
          WHERE hi.HotelId = h.Id
          ORDER BY ISNULL(hi.IsPrimary, 0) DESC, hi.Id ASC) AS PrimaryImageUrl,
        (SELECT COUNT(1) FROM RoomTypes rt WHERE rt.HotelId = h.Id) AS RoomTypeCount,
        (SELECT COUNT(1)
           FROM Bookings b
           JOIN BookingHotels bh ON b.Id = bh.BookingId
           JOIN Rooms r          ON bh.RoomId = r.Id
          WHERE r.HotelId = h.Id) AS TotalBookings
    FROM Hotels h
    LEFT JOIN Locations     l  ON h.LocationId     = l.Id
    LEFT JOIN PropertyTypes pt ON h.PropertyTypeId = pt.Id
    WHERE h.OwnerId = @PartnerId
      AND (@Status IS NULL OR h.Status = @Status)
    ORDER BY h.CreatedAt DESC;
END;
GO

/****** Object:  StoredProcedure [dbo].[sp_Partner_GetDashboardStats] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
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

/****** Object:  StoredProcedure [dbo].[sp_RegisterPartner] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_RegisterPartner]
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

/****** Object:  StoredProcedure [dbo].[sp_SearchHotels] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_SearchHotels]
    @LocationId INT,
    @CheckIn DATE,
    @CheckOut DATE,
    @Capacity INT,
    @MinPrice DECIMAL(18,2) = NULL,
    @MaxPrice DECIMAL(18,2) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    -- Sử dụng CTE đệ quy để lấy toàn bộ các địa điểm con thuộc địa điểm được tìm kiếm (ví dụ: các Quận thuộc Hà Nội)
    WITH LocationHierarchy AS (
        SELECT Id FROM Locations WHERE Id = @LocationId
        UNION ALL
        SELECT l.Id FROM Locations l
        INNER JOIN LocationHierarchy lh ON l.ParentId = lh.Id
    )
    SELECT DISTINCT h.Id, h.Name, h.Address, h.StarRating, h.Description, l.Name AS LocationName, 
           img.ImageUrl AS PrimaryImage,
           rt_min.MinPrice,
           pt.Name AS PropertyTypeName,
           pt.Code AS PropertyTypeCode
    FROM Hotels h
    JOIN Locations l ON h.LocationId = l.Id
    LEFT JOIN PropertyTypes pt ON h.PropertyTypeId = pt.Id
    JOIN RoomTypes rt ON rt.HotelId = h.Id
    LEFT JOIN HotelImages img ON h.Id = img.HotelId AND img.IsPrimary = 1
    CROSS APPLY (
        SELECT MIN(BasePrice) AS MinPrice 
        FROM RoomTypes 
        WHERE HotelId = h.Id
    ) rt_min
    WHERE h.LocationId IN (SELECT Id FROM LocationHierarchy)
      AND h.IsActive = 1
      AND h.[Status] = 1  -- chỉ trả hotel đã được Admin duyệt
      AND rt.Capacity >= @Capacity
      AND dbo.fn_GetAvailableRoomCount(rt.Id, @CheckIn, @CheckOut) > 0
      AND (@MinPrice IS NULL OR rt_min.MinPrice >= @MinPrice)
      AND (@MaxPrice IS NULL OR rt_min.MinPrice <= @MaxPrice)
    ORDER BY rt_min.MinPrice ASC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO

/****** Object:  Table [dbo].[PartnerPayouts]    Script Date: 25-May-26 10:00:00 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartnerPayouts](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [PartnerId] [int] NOT NULL,
    [BookingId] [int] NOT NULL,
    [GrossAmount] [decimal](18, 2) NOT NULL,
    [CommissionAmount] [decimal](18, 2) NOT NULL,
    [NetAmount] [decimal](18, 2) NOT NULL,
    [Status] [nvarchar](50) NOT NULL DEFAULT ('Pending'),
    [PayoutMethod] [nvarchar](50) NOT NULL DEFAULT ('Manual'),
    [PaidAt] [datetimeoffset](7) NULL,
    [TransactionReference] [nvarchar](100) NULL,
    [CreatedAt] [datetimeoffset](7) NOT NULL DEFAULT (sysdatetimeoffset()),
PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)) ON [PRIMARY]
GO

ALTER TABLE [dbo].[PartnerPayouts]  WITH CHECK ADD FOREIGN KEY([PartnerId])
REFERENCES [dbo].[Users] ([Id])
GO

ALTER TABLE [dbo].[PartnerPayouts]  WITH CHECK ADD FOREIGN KEY([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
GO

USE [master]
GO
ALTER DATABASE [WanderVN] SET  READ_WRITE 
GOALTER TABLE [dbo].[RatePlans]  WITH CHECK ADD FOREIGN KEY([RoomTypeId])
REFERENCES [dbo].[RoomTypes] ([Id])
GO
