import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { flightService, paymentService } from '../../services';
import type { FlightOfferDto } from '../../types';
import {
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import { PaymentSelector } from '../../components/client/checkout/PaymentSelector';
import { CheckoutTimer } from '../../components/client/checkout/CheckoutTimer';
import { FlightCheckoutProvider, useFlightCheckout } from '../../components/client/checkout/FlightCheckoutContext';
import { ContactInfoSection } from '../../components/client/checkout/ContactInfoSection';
import { PassengerListSection } from '../../components/client/checkout/PassengerListSection';
import { FlightSummarySidebar } from '../../components/client/checkout/FlightSummarySidebar';

export const FlightCheckout: React.FC = () => {
  const location = useLocation();
  const WANDER_SELECTED_OFFER = 'wander_selected_offer';
  const WANDER_SELECTED_PASSENGERS = 'wander_selected_passengers';

  const [offer] = useState<FlightOfferDto | null>(() => {
    const stateOffer = location.state?.offer as FlightOfferDto | undefined;
    if (stateOffer) {
      sessionStorage.setItem(WANDER_SELECTED_OFFER, JSON.stringify(stateOffer));
      return stateOffer;
    }
    const cachedOffer = sessionStorage.getItem(WANDER_SELECTED_OFFER);
    if (cachedOffer) {
      try {
        return JSON.parse(cachedOffer) as FlightOfferDto;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [passengerCounts] = useState(() => {
    const statePassengers = location.state?.passengers as { adults: number; children: number; infants: number } | undefined;
    if (statePassengers) {
      sessionStorage.setItem(WANDER_SELECTED_PASSENGERS, JSON.stringify(statePassengers));
      return statePassengers;
    }
    const cachedPassengers = sessionStorage.getItem(WANDER_SELECTED_PASSENGERS);
    if (cachedPassengers) {
      try {
        return JSON.parse(cachedPassengers) as { adults: number; children: number; infants: number };
      } catch {
        return { adults: 1, children: 0, infants: 0 };
      }
    }
    return { adults: 1, children: 0, infants: 0 };
  });

  if (!offer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center space-y-6 bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-8 shadow-xl limestone-shadow">
          <AlertTriangle className="h-12 w-12 text-secondary mx-auto" />
          <h2 className="font-display-lg text-headline-md text-primary">Không Tìm Thấy Chuyến Bay</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Phiên giao dịch đã hết hạn hoặc chưa có chuyến bay nào được chọn để thanh toán.
          </p>
          <Link
            to="/flights"
            className="w-full bg-primary text-on-primary py-3.5 text-xs uppercase tracking-widest hover:bg-primary/95 transition-all flex items-center justify-center gap-2 rounded-lg font-semibold"
          >
            Quay Lại Tìm Kiếm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <FlightCheckoutProvider initialOffer={offer} passengerCounts={passengerCounts}>
      <FlightCheckoutContent />
    </FlightCheckoutProvider>
  );
};

const FlightCheckoutContent: React.FC = () => {
  const navigate = useNavigate();
  const {
    offer,
    contactForm,
    passengersList,
    paymentMethod,
    setPaymentMethod,
    setBookingLoading,
    errorMessage,
    setErrorMessage,
    isExpired,
    setIsExpired,
    savePassengersToLocalStorage,
  } = useFlightCheckout();

  const storedUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
  const currentUserId = storedUserId ? parseInt(storedUserId, 10) : null;

  const handleTimerExpire = useCallback(() => {
    setIsExpired(true);
  }, [setIsExpired]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer || isExpired) return;

    // Validate that passengers have names and passport details
    const invalidPax = passengersList.find(
      (p) =>
        !p.familyName.trim() ||
        !p.givenName.trim() ||
        !p.bornOn.trim() ||
        !p.passportNumber.trim()
    );
    if (invalidPax) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin (Họ, Tên, Ngày sinh, Hộ chiếu) cho toàn bộ hành khách.");
      return;
    }

    setBookingLoading(true);
    setErrorMessage(null);

    try {
      const finalOfferId = offer.duffelAirwaysOfferId || offer.id;

      // Construct booking requests mapping all passengers
      const bookingRequest = {
        userId: currentUserId,
        offerId: finalOfferId,
        totalPrice: offer.totalAmount,
        passengers: passengersList.map((p) => ({
          id: p.id,
          title: p.title,
          familyName: p.familyName.trim().toUpperCase(),
          givenName: p.givenName.trim().toUpperCase(),
          bornOn: p.bornOn,
          email: p.email || contactForm.email,
          phoneNumber: p.phoneNumber || contactForm.phone,
          gender: p.gender,
          passportNumber: p.passportNumber.trim().toUpperCase(),
        })),
      };

      const result = await flightService.createBooking(bookingRequest);
      
      // Save passengers info to local storage for quick autocomplete in subsequent bookings
      savePassengersToLocalStorage();

      // Clear session values on success
      sessionStorage.removeItem('wander_selected_offer');
      sessionStorage.removeItem('wander_selected_passengers');

      if (paymentMethod === 'vnpay') {
        const paymentUrl = await paymentService.createVNPayUrl({ bookingId: result.bookingId });
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }

      if (paymentMethod === 'zalopay') {
        const paymentUrl = await paymentService.createZaloPayUrl({ bookingId: result.bookingId });
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }

      alert(`Đặt vé thành công! Mã đặt vé: ${result.bookingCode}`);
      navigate('/flights');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đặt vé.';
      setErrorMessage(message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-28 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        {/* Back link */}
        <Link
          to="/flights"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Quay lại tìm kiếm chuyến bay
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
            Xác nhận đặt vé
          </span>
          <h1 className="font-display-lg text-4xl md:text-5xl text-primary mt-1 leading-tight">
            Hoàn tất hành trình
          </h1>
        </div>

        {/* Đồng hồ đếm ngược giữ giá vé */}
        <div className="mb-8">
          <CheckoutTimer
            durationMinutes={15}
            onExpire={handleTimerExpire}
            label="Giá vé được giữ trong"
          />
        </div>

        {/* Cảnh báo hết phiên */}
        {isExpired && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>
              Phiên giữ giá vé đã hết hạn. Vui lòng quay lại tìm kiếm để cập nhật giá mới nhất
              trước khi tiếp tục đặt vé.
            </span>
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-3">
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
            {/* BƯỚC 1: Thông tin người liên hệ nhận vé */}
            <ContactInfoSection />

            {/* BƯỚC 2: Thông tin hành khách */}
            <PassengerListSection />

            {/* BƯỚC 3: Phương thức thanh toán */}
            <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
                <span className="text-sm font-semibold text-outline tabular-nums">03</span>
                <h2 className="text-base font-semibold text-primary tracking-tight">
                  Phương Thức Thanh Toán
                </h2>
              </div>
              <div className="p-6">
                <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
              </div>
            </section>
          </div>

          {/* === CỘT PHẢI: Tóm tắt chuyến bay (sticky) === */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-5">
            <FlightSummarySidebar />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlightCheckout;
