import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { flightService } from '../../services';
import type { FlightOfferDetailDto } from '../../types';
import { FlightSummaryCard } from '../../components/client/flight-detail/FlightSummaryCard';
import { FlightRouteCard } from '../../components/client/flight-detail/FlightRouteCard';
import { PricingCard } from '../../components/client/flight-detail/PricingCard';
import { PassengerForm } from '../../components/client/flight-detail/PassengerForm';
import type { PassengerFormValues } from '../../components/client/flight-detail/PassengerForm';
import { BookingSidebar } from '../../components/client/flight-detail/BookingSidebar';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { ArrowLeft } from 'lucide-react';

export const FlightDetail: React.FC = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<FlightOfferDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      if (!offerId) {
        setPageError('Không tìm thấy mã offer.');
        setLoading(false);
        return;
      }

      console.log('offerId', offerId);
      setPageError(null);
      setLoading(true);

      try {
        const apiUrl = `/search/validate-offer/${offerId}`;
        console.log('API URL', apiUrl);
        const response = await flightService.getOfferById(offerId);
        console.log('API response', response);
        setOffer(response);
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'Không thể tải thông tin chuyến bay.';
        setPageError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]);

  const handleBookingSubmit = async (values: PassengerFormValues) => {
    if (!offer) return;
    setPageError(null);
    setBookingSuccess(null);
    setBookingLoading(true);

    const names = values.fullName.trim().split(/\s+/);
    const familyName = names.length > 1 ? names.pop() ?? '' : values.fullName;
    const givenName = names.join(' ') || familyName;
    const passengerId = offer.duffelAirwaysPassengerId || offer.passengerId || offer.id;
    const finalOfferId = offer.duffelAirwaysOfferId || offer.id;

    const bookingRequest = {
      userId: 1,
      offerId: finalOfferId,
      totalPrice: offer.totalAmount,
      passengers: [
        {
          id: passengerId,
          title: 'mr',
          familyName,
          givenName,
          bornOn: '1990-01-01',
          email: values.email,
          phoneNumber: values.phoneNumber,
          gender: 'm',
          passportNumber: values.passportNumber
        }
      ]
    };

    try {
      const result = await flightService.createBooking(bookingRequest);
      setBookingSuccess(`Đặt vé thành công! Mã đặt vé: ${result.bookingCode}`);
      setTimeout(() => {
        navigate('/flights');
      }, 1200);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Lỗi khi tạo booking. Vui lòng thử lại.';
      setPageError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const hasOfferError = Boolean(pageError);
  const isOfferExpired = offer?.isExpired ?? false;

  return (
    <div className="min-h-screen bg-background text-on-background py-8 md:py-12 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="font-label-md text-xs uppercase tracking-[0.3em] text-secondary/70">Chi tiết chuyến bay</span>
            <h1 className="font-display-xl text-headline-lg text-primary mt-3">Hành trình hạng thượng lưu</h1>
            <p className="mt-2 text-body-md text-on-surface-variant max-w-2xl">
              Xem lại offer trực tiếp từ Duffel, xác thực trạng thái và xác nhận thông tin hành khách trước khi đặt vé.
            </p>
          </div>
          <Link
            to="/flights"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-outline-variant text-label-md text-on-surface transition hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại tìm kiếm
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={1} />
        ) : hasOfferError ? (
          <ErrorState
            title="Không thể tải thông tin chuyến bay"
            message={pageError || 'Đã xảy ra lỗi khi truy xuất offer.'}
            actionLabel="Trở về tìm kiếm"
            actionTo="/flights"
          />
        ) : offer ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="space-y-8">
              {isOfferExpired && (
                <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 p-6 text-amber-200 shadow-[0_25px_80px_rgba(255,215,0,0.08)]">
                  <p className="font-semibold text-on-surface">Offer này đã hết hạn hoặc không còn khả dụng.</p>
                  <p className="text-sm text-on-surface-variant mt-1">Vui lòng quay lại trang tìm kiếm để chọn offer khác.</p>
                </div>
              )}

              <FlightSummaryCard offer={offer} />
              <FlightRouteCard offer={offer} />
              <PricingCard offer={offer} />
              <PassengerForm
                formId="flight-detail-booking-form"
                onSubmit={handleBookingSubmit}
                isSubmitting={bookingLoading}
                errorMessage={pageError}
              />
              {bookingSuccess && (
                <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-100">
                  <p className="font-semibold">{bookingSuccess}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">Bạn sẽ được chuyển hướng về trang tìm kiếm trong giây lát.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <BookingSidebar
                offer={offer}
                formId="flight-detail-booking-form"
                isSubmitting={bookingLoading}
                disabled={isOfferExpired}
              />
            </div>
          </div>
        ) : (
          <ErrorState
            title="Chuyến bay không hợp lệ"
            message="Offer không tồn tại hoặc đã bị hủy. Vui lòng quay lại trang tìm kiếm để tiếp tục."
            actionLabel="Tìm chuyến bay khác"
            actionTo="/flights"
          />
        )}
      </div>
    </div>
  );
};

export default FlightDetail;
