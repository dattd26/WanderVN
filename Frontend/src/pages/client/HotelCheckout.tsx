import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { hotelService, paymentService } from '../../services';
import type { HotelDetailDto, RoomTypeInfo, CreateHotelBookingRequest } from '../../types';
import {
  Loader2,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import { PaymentSelector, type PaymentMethod } from '../../components/client/checkout/PaymentSelector';
import { ContactForm } from '../../components/client/checkout/ContactForm';
import { GuestForm } from '../../components/client/checkout/GuestForm';
import { SpecialRequestsForm } from '../../components/client/checkout/SpecialRequestsForm';
import { HotelBookingSummary } from '../../components/client/checkout/HotelBookingSummary';
import { BookingSuccessModal } from '../../components/client/checkout/BookingSuccessModal';

const SPECIAL_REQUEST_OPTIONS = [
  { id: 'non-smoking', label: 'Phòng không hút thuốc' },
  { id: 'high-floor', label: 'Tầng cao, thoáng đãng' },
  { id: 'king-bed', label: 'Giường đôi lớn (King)' },
  { id: 'early-checkin', label: 'Nhận phòng sớm (nếu có thể)' },
  { id: 'late-checkout', label: 'Trả phòng muộn (nếu có thể)' },
];

const CHECKIN_TIME_OPTIONS = [
  'Trước 14:00 (không đảm bảo)',
  '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', 'Sau 22:00',
];

const NATIONALITIES = ['Việt Nam', 'Khác'];

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const HotelCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hotelId = searchParams.get('hotelId') ? parseInt(searchParams.get('hotelId')!) : 0;
  const roomTypeId = searchParams.get('roomTypeId') ? parseInt(searchParams.get('roomTypeId')!) : 0;
  const checkInDate = searchParams.get('checkInDate') || '';
  const checkOutDate = searchParams.get('checkOutDate') || '';

  const isValidRequest = hotelId > 0 && roomTypeId > 0;
  const [hotel, setHotel] = useState<HotelDetailDto | null>(null);
  const [room, setRoom] = useState<RoomTypeInfo | null>(null);
  const [loading, setLoading] = useState(isValidRequest);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    isValidRequest ? null : 'Thông tin yêu cầu đặt phòng không hợp lệ.'
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingCode, setSuccessBookingCode] = useState('');

  const storedUserStr = localStorage.getItem('user');
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay');

  // Thông tin người liên hệ (nhận email xác nhận)
  const [contactForm, setContactForm] = useState({
    email: storedUser.email || localStorage.getItem('email') || '',
    phone: storedUser.phone || storedUser.phoneNumber || localStorage.getItem('phone') || '',
  });

  // Thông tin khách lưu trú chính
  const [isSelfGuest, setIsSelfGuest] = useState(true);
  const [guestForm, setGuestForm] = useState({
    title: 'mr',
    fullName: storedUser.fullName || localStorage.getItem('fullName') || '',
    nationality: 'Việt Nam',
    passportNumber: '',
  });

  // Yêu cầu đặc biệt
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [expectedCheckinTime, setExpectedCheckinTime] = useState('14:00');
  const [additionalNote, setAdditionalNote] = useState('');

  useEffect(() => {
    if (!hotelId || !roomTypeId) {
      const t = setTimeout(() => {
        setErrorMessage('Thông tin yêu cầu đặt phòng không hợp lệ.');
        setLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }

    hotelService
      .getHotelDetail(hotelId)
      .then((data) => {
        setHotel(data);
        const selectedRoom = data.roomTypes.find((r) => r.id === roomTypeId);
        if (selectedRoom) {
          setRoom(selectedRoom);
        } else {
          setErrorMessage('Hạng phòng được chọn không tồn tại hoặc đã hết.');
        }
        setLoading(false);
      })
      .catch(() => {
        setErrorMessage('Không thể tải thông tin khách sạn để thanh toán.');
        setLoading(false);
      });
  }, [hotelId, roomTypeId]);

  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const roomBasePrice = room ? room.basePrice : 0;
  const subtotal = roomBasePrice * nights;
  const VAT_RATE = 0.10;
  const taxAmount = Math.round(subtotal * VAT_RATE);
  const totalAmount = subtotal + taxAmount;

  const handleToggleSpecialRequest = (id: string) => {
    setSpecialRequests((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel || !room) return;

    setBookingLoading(true);
    setErrorMessage(null);

    const storedUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    const currentUserId = storedUserId ? parseInt(storedUserId, 10) : null;

    const guestName = isSelfGuest ? guestForm.fullName : guestForm.fullName;

    const bookingRequest: CreateHotelBookingRequest = {
      userId: currentUserId,
      roomTypeId: room.id,
      checkInDate,
      checkOutDate,
      totalPrice: totalAmount,
      email: contactForm.email,
      customerName: guestName,
      customerPhone: contactForm.phone,
    };

    try {
      const response = await hotelService.createHotelBooking(bookingRequest);
      setSuccessBookingCode(response.bookingCode);

      if (paymentMethod === 'vnpay') {
        const paymentUrl = await paymentService.createVNPayUrl({ bookingId: response.bookingId });
        if (paymentUrl) {
          window.location.assign(paymentUrl);
          return;
        }
      } else if (paymentMethod === 'zalopay') {
        const paymentUrl = await paymentService.createZaloPayUrl({ bookingId: response.bookingId });
        if (paymentUrl) {
          window.location.assign(paymentUrl);
          return;
        }
      } else {
        setBookingLoading(false);
        setShowSuccessModal(true);
      }
    } catch (error: unknown) {
      const err = error as { message?: string } | null;
      setErrorMessage(err?.message || 'Có lỗi bất ngờ xảy ra khi tạo đơn đặt phòng của bạn.');
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-secondary animate-spin" />
        <p className="text-sm text-on-surface-variant italic animate-pulse">
          Đang chuẩn bị hồ sơ đặt phòng...
        </p>
      </div>
    );
  }

  if (errorMessage && !hotel) {
    return (
      <div className="max-w-md mx-auto my-32 p-8 text-center border border-outline-variant/30 bg-surface-container-low rounded-lg">
        <AlertTriangle className="h-12 w-12 text-error-color mx-auto mb-4" />
        <h3 className="font-display-lg text-headline-md text-primary mb-2">Đã xảy ra lỗi</h3>
        <p className="text-sm text-on-surface-variant mb-6">{errorMessage}</p>
        <Link
          to="/stays"
          className="px-6 py-2 bg-primary text-on-primary font-semibold text-xs tracking-wider uppercase rounded hover:bg-primary/95 transition-all"
        >
          Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-28 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">

        {/* Breadcrumb / Back link */}
        <Link
          to={`/hotel/${hotelId}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Quay lại chi tiết khách sạn
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
            Xác nhận đặt lưu trú
          </span>
          <h1 className="font-display-lg text-4xl md:text-5xl text-primary mt-1 leading-tight">
            Hoàn tất đặt phòng
          </h1>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="mb-8 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleBookingSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* === CỘT TRÁI === */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">

            {/* BƯỚC 1: Thông tin người liên hệ */}
            <ContactForm
              email={contactForm.email}
              phone={contactForm.phone}
              onChange={(field, val) => setContactForm({ ...contactForm, [field]: val })}
            />

            {/* BƯỚC 2: Thông tin khách lưu trú */}
            <GuestForm
              isSelfGuest={isSelfGuest}
              onSelfGuestChange={setIsSelfGuest}
              guestForm={guestForm}
              onChange={(field, val) => setGuestForm({ ...guestForm, [field]: val })}
              nationalities={NATIONALITIES}
            />

            {/* BƯỚC 3: Yêu cầu đặc biệt */}
            <SpecialRequestsForm
              specialRequests={specialRequests}
              onToggleRequest={handleToggleSpecialRequest}
              expectedCheckinTime={expectedCheckinTime}
              onExpectedCheckinTimeChange={setExpectedCheckinTime}
              additionalNote={additionalNote}
              onAdditionalNoteChange={setAdditionalNote}
              specialRequestOptions={SPECIAL_REQUEST_OPTIONS}
              checkinTimeOptions={CHECKIN_TIME_OPTIONS}
            />

            {/* BƯỚC 4: Phương thức thanh toán */}
            <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
                <span className="text-sm font-semibold text-outline tabular-nums">04</span>
                <h2 className="text-base font-semibold text-primary tracking-tight">
                  Phương Thức Thanh Toán
                </h2>
              </div>
              <div className="p-6">
                <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
              </div>
            </section>

          </div>

          {/* === CỘT PHẢI: Tóm tắt đặt phòng (sticky) === */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-5">
            {hotel && room && (
              <HotelBookingSummary
                hotel={hotel}
                room={room}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                nights={nights}
                roomBasePrice={roomBasePrice}
                subtotal={subtotal}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
                bookingLoading={bookingLoading}
                formatDate={formatDate}
              />
            )}
          </div>
        </form>
      </div>

      {/* MODAL THÀNH CÔNG (Thẻ tín dụng Demo) */}
      {showSuccessModal && (
        <BookingSuccessModal
          email={contactForm.email}
          bookingCode={successBookingCode}
          hotelName={hotel?.name}
          roomName={room?.name}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          totalAmount={totalAmount}
          onNavigateHistory={() => navigate('/bookings/history')}
          onNavigateHome={() => navigate('/')}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default HotelCheckout;
