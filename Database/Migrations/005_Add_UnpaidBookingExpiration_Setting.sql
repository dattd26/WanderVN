IF NOT EXISTS (SELECT 1 FROM SystemSettings WHERE [Key] = 'UnpaidBookingExpirationMinutes')
BEGIN
    INSERT INTO SystemSettings ([Key], [Value], [Description])
    VALUES (
        'UnpaidBookingExpirationMinutes',
        '30',
        N'Số phút giữ phòng cho booking khách sạn chưa thanh toán trước khi tự động hủy.'
    );
END;
