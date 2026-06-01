ALTER TABLE Bookings                                                                  
  ADD DuffelAmountVnd DECIMAL(18,2) NULL,                   
      MarkupAmountVnd DECIMAL(18,2) NULL,
      PaymentFeeVnd   DECIMAL(18,2) NULL;                                               
   
-- Sửa 'Key' thành '[Key]' ở dòng dưới đây
INSERT INTO SystemSettings ([Key], Value, Description) VALUES
('FlightMarkupPercent', '5',     N'Markup WanderVN cho vé máy bay (%)'),              
('VNPayFeeVnd',         '10000', N'Phí cổng thanh toán VNPay (VNĐ)'),                 
('ZaloPayFeeVnd',       '10000', N'Phí cổng thanh toán ZaloPay (VNĐ)');