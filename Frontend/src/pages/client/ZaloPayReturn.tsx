import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Building, ShieldCheck, ArrowRight, Home, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { paymentService } from '../../services';

export const ZaloPayReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Lấy thông tin trực tiếp từ Query String của ZaloPay gửi về
  const status = searchParams.get('status') || '';
  const isSuccess = status === '1';
  const appTransId = searchParams.get('apptransid') || '';
  const rawAmount = searchParams.get('amount') || '0';
  const bankCode = searchParams.get('bankcode') || '';

  // Trích xuất bookingId từ apptransid (format yyMMdd_bookingId_HHmmss)
  const bookingIdParts = appTransId.split('_');
  const bookingId = bookingIdParts.length > 1 ? bookingIdParts[1] : appTransId;

  // Số tiền của ZaloPay trả về
  const amount = rawAmount ? parseFloat(rawAmount) : 0;

  // Thanh toán lại đơn đang chờ bằng chính cổng ZaloPay
  const handleRetryPayment = async () => {
    const id = parseInt(bookingId, 10);
    if (!id || Number.isNaN(id)) {
      setRetryError('Không xác định được mã đơn để thanh toán lại.');
      return;
    }

    setIsRetrying(true);
    setRetryError(null);
    try {
      const paymentUrl = await paymentService.createZaloPayUrl({ bookingId: id });
      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }
      setRetryError('Không khởi tạo được liên kết thanh toán.');
    } catch (err: unknown) {
      setRetryError((err as Error).message || 'Có lỗi xảy ra khi tạo liên kết thanh toán.');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-20 px-margin-mobile md:px-margin-desktop bg-background text-on-surface relative">
      <div className="max-w-2xl w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-8 md:p-12 shadow-2xl limestone-shadow animate-scale-in">
        {isSuccess ? (
          /* Trạng thái giao dịch thành công */
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-emerald-50 rounded-full border border-emerald-200">
                <CheckCircle className="h-16 w-16 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <span className="font-label-md text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-3">
              Thanh toán thành công
            </span>
            <h1 className="font-display-lg text-headline-lg text-primary mb-4">
              Bạn sẽ sớm nhận được Email thông tin từ hệ thống!
            </h1>
            <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed max-w-lg mx-auto">
              Chúc mừng! Yêu cầu thanh toán qua ví <strong>ZaloPay</strong> đã được phê duyệt và xác thực an toàn. Chuyến đi của quý khách đã chính thức được bảo lưu.
            </p>

            {/* Chi tiết biên lai thanh toán sang trọng */}
            <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 text-left space-y-4 mb-10">
              <h3 className="font-label-md text-sm text-primary border-b border-outline-variant/20 pb-3 uppercase tracking-wider">
                Chi Tiết Giao Dịch
              </h3>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant flex items-center gap-2">
                  Mã tham chiếu:
                </span>
                <span className="font-semibold text-primary">#{bookingId}</span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant flex items-center gap-2">
                  Mã giao dịch ZaloPay:
                </span>
                <span className="font-mono text-xs text-on-surface bg-surface border border-outline-variant/10 px-2 py-0.5 rounded">
                  {appTransId}
                </span>
              </div>

              {bankCode && (
                <div className="flex justify-between items-center text-body-md">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <Building className="h-4 w-4 text-outline" /> Ngân hàng / Kênh thanh toán:
                  </span>
                  <span className="font-semibold text-primary">{bankCode}</span>
                </div>
              )}

              <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="text-on-surface font-semibold">Tổng cộng chi phí:</span>
                <span className="font-display-lg text-xl text-secondary font-bold">
                  {amount.toLocaleString('vi-VN')} VND
                </span>
              </div>
            </div>

            {/* Điều hướng */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" /> Quay Lại Trang Chủ
              </Link>
              <Link
                to="/flights"
                className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 bg-primary text-on-primary hover:bg-surface-tint transition-all flex items-center justify-center gap-2"
              >
                Đặt Chuyến Bay Khác <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Trạng thái giao dịch thất bại/hủy bỏ */
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-red-50 rounded-full border border-red-200">
                <XCircle className="h-16 w-16 text-red-600 animate-bounce" />
              </div>
            </div>
            <span className="font-label-md text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-3">
              Giao dịch chưa hoàn tất
            </span>
            <h1 className="font-display-lg text-headline-lg text-primary mb-4">
              Thanh Toán Bị Gián Đoạn
            </h1>
            <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed max-w-lg mx-auto">
              Giao dịch thông qua ZaloPay đã bị hủy bởi người dùng hoặc xảy ra lỗi kết nối. Số tiền của quý khách vẫn chưa bị trừ.
            </p>

            <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 text-left space-y-4 mb-10">
              <h3 className="font-label-md text-sm text-red-600 border-b border-outline-variant/20 pb-3 uppercase tracking-wider">
                Thông Tin Chi Tiết Lỗi
              </h3>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Mã giao dịch liên kết:</span>
                <span className="font-semibold text-primary">#{bookingId}</span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Mã lỗi cổng phản hồi:</span>
                <span className="font-semibold font-mono text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded text-xs">
                  Status Code: {status}
                </span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Trạng thái:</span>
                <span className="text-sm text-on-surface-variant italic">Giao dịch bị từ chối hoặc người dùng hủy bỏ</span>
              </div>
            </div>

            {retryError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-3 text-left">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-semibold">{retryError}</span>
              </div>
            )}

            {/* Điều hướng */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" /> Quay Lại Trang Chủ
              </Link>
              {bookingId ? (
                <button
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 bg-secondary text-on-primary hover:bg-on-secondary-container transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:animate-none animate-pulse"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang khởi tạo...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" /> Thực Hiện Lại Giao Dịch
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/booking-lookup"
                  className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 bg-secondary text-on-primary hover:bg-on-secondary-container transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <RefreshCw className="h-4 w-4" /> Tra Cứu & Thanh Toán Lại
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Footer bảo mật */}
        <div className="mt-12 flex items-center justify-center gap-3 text-on-surface-variant opacity-60 text-xs border-t border-outline-variant/10 pt-6">
          <ShieldCheck className="h-4.5 w-4.5 text-secondary" />
          <span>Hệ thống WanderVN tích hợp bảo mật tối đa của đối tác ZaloPay</span>
        </div>
      </div>
    </div>
  );
};

export default ZaloPayReturn;
