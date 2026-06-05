import React from 'react';
import { CheckCircle } from 'lucide-react';

interface BookingSuccessModalProps {
  email: string;
  bookingCode: string;
  hotelName?: string;
  roomName?: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  onNavigateHistory: () => void;
  onNavigateHome: () => void;
  formatDate: (dateStr: string) => string;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  email,
  bookingCode,
  hotelName,
  roomName,
  checkInDate,
  checkOutDate,
  totalAmount,
  onNavigateHistory,
  onNavigateHome,
  formatDate,
}) => {
  return (
    <div className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-container-lowest max-w-md w-full border border-outline-variant/30 p-8 rounded-lg text-center shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-secondary" />

        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
          <CheckCircle className="h-9 w-9 text-green-600" />
        </div>

        <div className="space-y-2">
          <h3 className="font-display-lg text-2xl text-primary font-bold">Đặt Phòng Thành Công!</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Yêu cầu đặt lưu trú của bạn đã được tiếp nhận. Email xác nhận đã gửi tới{' '}
            <strong>{email}</strong>.
          </p>
        </div>

        <div className="bg-surface-container-low/40 p-4 rounded-lg border border-outline-variant/20 space-y-2.5 text-sm text-left">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Mã đặt chỗ:</span>
            <span className="font-bold text-primary font-mono">{bookingCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Khách sạn:</span>
            <span className="font-semibold text-right max-w-[60%]">{hotelName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Hạng phòng:</span>
            <span className="font-semibold">{roomName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Thời gian:</span>
            <span className="font-semibold">{formatDate(checkInDate)} đến {formatDate(checkOutDate)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-outline-variant/15">
            <span className="font-bold text-on-surface">Tổng thanh toán:</span>
            <span className="font-bold text-red-600">{totalAmount.toLocaleString('vi-VN')} VND</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onNavigateHistory}
            className="w-full py-3 bg-secondary hover:bg-secondary/90 text-on-primary font-semibold text-xs uppercase tracking-widest rounded-lg transition-colors"
          >
            Xem lịch sử đặt phòng
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full py-2.5 border border-outline-variant/30 text-on-surface-variant hover:text-primary text-xs uppercase tracking-wider rounded-lg transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};
