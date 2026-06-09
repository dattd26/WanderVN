-- script_seed_airports.sql
-- Seed data cho các sân bay Việt Nam và một số sân bay quốc tế phổ biến

USE WanderVN;
GO

SET IDENTITY_INSERT Airports ON;

MERGE INTO Airports AS Target
USING (VALUES 
    (1, 'HAN', 'Noi Bai International Airport', N'Hà Nội'),
    (2, 'SGN', 'Tan Son Nhat International Airport', N'Hồ Chí Minh'),
    (3, 'DAD', 'Da Nang International Airport', N'Đà Nẵng'),
    (4, 'CXR', 'Cam Ranh International Airport', N'Nha Trang'),
    (5, 'PQC', 'Phu Quoc International Airport', N'Phú Quốc'),
    (6, 'HPH', 'Cat Bi International Airport', N'Hải Phòng'),
    (7, 'VCA', 'Can Tho International Airport', N'Cần Thơ'),
    (8, 'VII', 'Vinh International Airport', N'Vinh'),
    (9, 'HUI', 'Phu Bai International Airport', N'Huế'),
    (10, 'VDH', 'Dong Hoi Airport', N'Đồng Hới'),
    (11, 'VCL', 'Chu Lai International Airport', N'Quảng Nam'),
    (12, 'UIH', 'Phu Cat Airport', N'Quy Nhơn'),
    (13, 'TBB', 'Tuy Hoa Airport', N'Tuy Hòa'),
    (14, 'BMV', 'Buon Ma Thuot Airport', N'Buôn Ma Thuột'),
    (15, 'DLI', 'Lien Khuong Airport', N'Đà Lạt'),
    (16, 'PXU', 'Pleiku Airport', N'Pleiku'),
    (17, 'DIN', 'Dien Bien Phu Airport', N'Điện Biên'),
    (18, 'THD', 'Tho Xuan Airport', N'Thanh Hóa'),
    (19, 'VKG', 'Rach Gia Airport', N'Rạch Giá'),
    (20, 'VCS', 'Con Dao Airport', N'Côn Đảo'),
    (21, 'CAH', 'Ca Mau Airport', N'Cà Mau'),
    (22, 'VDO', 'Van Don International Airport', N'Quảng Ninh'),
    
    -- Một số sân bay quốc tế phổ biến
    (23, 'BKK', 'Suvarnabhumi Airport', N'Bangkok'),
    (24, 'SIN', 'Changi Airport', N'Singapore'),
    (25, 'HKG', 'Hong Kong International Airport', N'Hong Kong'),
    (26, 'NRT', 'Narita International Airport', N'Tokyo'),
    (27, 'ICN', 'Incheon International Airport', N'Seoul')
) AS Source (Id, IataCode, Name, City)
ON Target.Id = Source.Id
WHEN MATCHED THEN
    UPDATE SET 
        IataCode = Source.IataCode,
        Name = Source.Name,
        City = Source.City
WHEN NOT MATCHED BY TARGET THEN
    INSERT (Id, IataCode, Name, City) 
    VALUES (Source.Id, Source.IataCode, Source.Name, Source.City);

SET IDENTITY_INSERT Airports OFF;
GO
