USE [master]
GO
/****** Object:  Database [WanderVN]    Script Date: 18-May-26 6:31:12 PM ******/
CREATE DATABASE [WanderVN]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'WanderVN', FILENAME = N'D:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\WanderVN.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'WanderVN_log', FILENAME = N'D:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\WanderVN_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
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

---------------------------------------------------------
-- 8. BUSINESS LOGIC (FUNCTIONS & PROCEDURES)
---------------------------------------------------------

-- Hàm kiểm tra phòng trống
CREATE   FUNCTION [dbo].[fn_GetAvailableRoomCount] 
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[IataCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[BookingCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Locations]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Locations](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[ImageUrl] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Rooms]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Rooms](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RoomTypeId] [int] NULL,
	[RoomNumber] [varchar](20) NOT NULL,
	[Status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
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
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TourImages]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TourImages](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TourId] [int] NULL,
	[ImageUrl] [nvarchar](500) NOT NULL,
	[IsPrimary] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tours]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tours](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[LocationId] [int] NULL,
	[Name] [nvarchar](200) NOT NULL,
	[DurationDays] [int] NULL,
	[Price] [decimal](18, 2) NOT NULL,
	[Description] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Booking_Code]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_Booking_Code] ON [dbo].[Bookings]
(
	[BookingCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Booking_User]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_Booking_User] ON [dbo].[Bookings]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_HotelImages_Primary]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_HotelImages_Primary] ON [dbo].[HotelImages]
(
	[HotelId] ASC
)
WHERE ([IsPrimary]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Hotels_Location]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_Hotels_Location] ON [dbo].[Hotels]
(
	[LocationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Hotels_Owner]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_Hotels_Owner] ON [dbo].[Hotels]
(
	[OwnerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RoomTypes_Hotel]    Script Date: 18-May-26 6:31:13 PM ******/
CREATE NONCLUSTERED INDEX [IX_RoomTypes_Hotel] ON [dbo].[RoomTypes]
(
	[HotelId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
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
ALTER TABLE [dbo].[Payments] ADD  DEFAULT (sysdatetimeoffset()) FOR [PaymentDate]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT ('Available') FOR [Status]
GO
ALTER TABLE [dbo].[RoomTypeImages] ADD  DEFAULT ((0)) FOR [IsPrimary]
GO
ALTER TABLE [dbo].[TourImages] ADD  DEFAULT ((0)) FOR [IsPrimary]
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
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD FOREIGN KEY([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD FOREIGN KEY([RoomTypeId])
REFERENCES [dbo].[RoomTypes] ([Id])
GO
ALTER TABLE [dbo].[RoomTypeImages]  WITH CHECK ADD FOREIGN KEY([RoomTypeId])
REFERENCES [dbo].[RoomTypes] ([Id])
GO
ALTER TABLE [dbo].[RoomTypes]  WITH CHECK ADD FOREIGN KEY([HotelId])
REFERENCES [dbo].[Hotels] ([Id])
GO
ALTER TABLE [dbo].[TourImages]  WITH CHECK ADD FOREIGN KEY([TourId])
REFERENCES [dbo].[Tours] ([Id])
GO
ALTER TABLE [dbo].[Tours]  WITH CHECK ADD FOREIGN KEY([LocationId])
REFERENCES [dbo].[Locations] ([Id])
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([Id])
GO
ALTER TABLE [dbo].[Wishlists]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Hotels]  WITH CHECK ADD CHECK  (([StarRating]>=(1) AND [StarRating]<=(5)))
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateHotelBooking]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- SP Tạo đơn đặt phòng (Transaction & Overbooking)
CREATE   PROCEDURE [dbo].[sp_CreateHotelBooking]
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
/****** Object:  StoredProcedure [dbo].[sp_Partner_AddHotelImage]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- Kịch bản 3: Lưu hình ảnh đã upload từ Cloudinary vào Database
CREATE   PROCEDURE [dbo].[sp_Partner_AddHotelImage]
    @PartnerId INT,
    @HotelId INT,
    @ImageUrl NVARCHAR(500),
    @IsPrimary BIT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra bảo mật: Khách sạn thêm ảnh phải thuộc sở hữu của Partner
    IF NOT EXISTS (SELECT 1 FROM Hotels WHERE Id = @HotelId AND OwnerId = @PartnerId)
    BEGIN
        RAISERROR('403: Bạn không có quyền quản lý hình ảnh của khách sạn này!', 16, 1);
        RETURN;
    END

    -- Nếu ảnh mới được đặt làm ảnh chính (Primary), hạ các ảnh chính cũ xuống 0
    IF @IsPrimary = 1
    BEGIN
        UPDATE HotelImages SET IsPrimary = 0 WHERE HotelId = @HotelId;
    END

    -- Ghi nhận URL từ Cloudinary vào Database
    INSERT INTO HotelImages (HotelId, ImageUrl, IsPrimary)
    VALUES (@HotelId, @ImageUrl, @IsPrimary);
    
    SELECT SCOPE_IDENTITY() AS NewImageId;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_Partner_GetDashboardStats]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- Kịch bản 4: Xem báo cáo thống kê doanh thu và đơn đặt phòng (Dashboard Analytics)
CREATE   PROCEDURE [dbo].[sp_Partner_GetDashboardStats]
    @PartnerId INT,
    @HotelId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra bảo mật quyền sở hữu dữ liệu khách sạn
    IF NOT EXISTS (SELECT 1 FROM Hotels WHERE Id = @HotelId AND OwnerId = @PartnerId)
    BEGIN
        RAISERROR('403: Bạn không có quyền truy cập dữ liệu của khách sạn này!', 16, 1);
        RETURN;
    END

    -- Truy vấn tổng hợp số liệu cho Vendor Dashboard
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
/****** Object:  StoredProcedure [dbo].[sp_Partner_UpdateRoomType]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- Kịch bản 2: Cập nhật thông tin và cấu hình giá loại phòng (Có Check quyền sở hữu)
CREATE   PROCEDURE [dbo].[sp_Partner_UpdateRoomType]
    @PartnerId INT,
    @RoomTypeId INT,
    @Name NVARCHAR(100),
    @BasePrice DECIMAL(18,2),
    @Capacity INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra bảo mật: Loại phòng chỉnh sửa phải thuộc khách sạn mà Partner sở hữu
    IF NOT EXISTS (
        SELECT 1 FROM RoomTypes rt
        JOIN Hotels h ON rt.HotelId = h.Id
        WHERE rt.Id = @RoomTypeId AND h.OwnerId = @PartnerId
    )
    BEGIN
        RAISERROR('403: Bạn không có quyền chỉnh sửa loại phòng này!', 16, 1);
        RETURN;
    END

    -- Thực hiện cập nhật dữ liệu
    UPDATE RoomTypes
    SET Name = @Name,
        BasePrice = @BasePrice,
        Capacity = @Capacity
    WHERE Id = @RoomTypeId;
    
    SELECT @@ROWCOUNT AS UpdatedRows;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_RegisterPartner]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


---------------------------------------------------------
-- 1. STORED PROCEDURES CHO ĐỐI TÁC (PARTNER FLOWS)
---------------------------------------------------------

-- Kịch bản 1: Đăng ký tài khoản và khởi tạo cơ sở lưu trú (Transaction)
CREATE   PROCEDURE [dbo].[sp_RegisterPartner]
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
        -- Đảm bảo Role 'Partner' tồn tại trong hệ thống
        DECLARE @RoleId INT;
        SELECT @RoleId = Id FROM Roles WHERE Name = 'Partner';
        IF @RoleId IS NULL
        BEGIN
            INSERT INTO Roles (Name) VALUES ('Partner');
            SET @RoleId = SCOPE_IDENTITY();
        END

        -- Tạo tài khoản User quyền Partner
        INSERT INTO Users (RoleId, Email, PasswordHash, FullName, PhoneNumber, IsActive)
        VALUES (@RoleId, @Email, @PasswordHash, @FullName, @PhoneNumber, 1);
        
        DECLARE @UserId INT = SCOPE_IDENTITY();

        -- Khởi tạo thông tin Khách sạn shell gắn liền với OwnerId vừa tạo
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
/****** Object:  StoredProcedure [dbo].[sp_SearchHotels]    Script Date: 18-May-26 6:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- SP Tìm kiếm khách sạn (Kèm ảnh chính)
CREATE   PROCEDURE [dbo].[sp_SearchHotels]
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
USE [master]
GO
ALTER DATABASE [WanderVN] SET  READ_WRITE 
GO
