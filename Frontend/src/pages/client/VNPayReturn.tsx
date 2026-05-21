import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, Building, ShieldCheck, ArrowRight, Home, RefreshCw } from 'lucide-react';


export const VNPayReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [vnpayTxnRef, setVnpayTxnRef] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [txnNo, setTxnNo] = useState<string>('');
  const [bankCode, setBankCode] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');
  const [responseCode, setResponseCode] = useState<string>('');

  useEffect(() => {
    // Lấy thông tin từ Query String của VNPay gửi về
    const code = searchParams.get('vnp_ResponseCode') || '';
    const txnRef = searchParams.get('vnp_TxnRef') || '';
    const rawAmount = searchParams.get('vnp_Amount') || '0';
    const transactionNo = searchParams.get('vnp_TransactionNo') || '';
    const bank = searchParams.get('vnp_BankCode') || '';
    const date = searchParams.get('vnp_PayDate') || '';

    setResponseCode(code);
    setIsSuccess(code === '00');
    setVnpayTxnRef(txnRef);
    setTxnNo(transactionNo);
    setBankCode(bank);
    setPayDate(date);

    // Trích xuất bookingId thực tế từ vnp_TxnRef dạng bookingId_Ticks
    if (txnRef) {
      const idPart = txnRef.split('_')[0];
      setBookingId(idPart);
    }

    // Đổi số tiền (chia cho 100 theo quy định VNPay)
    if (rawAmount) {
      setAmount(parseFloat(rawAmount) / 100);
    }
  }, [searchParams]);

  // Hàm chuyển đổi định dạng yyyyMMddHHmmss của VNPay sang hiển thị thân thiện tiếng Việt
  const formatVNPayDate = (dateStr: string) => {
    if (!dateStr || dateStr.length < 14) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${hour}:${minute}:${second} ngày ${day}/${month}/${year}`;
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
              Hành Trình Di Sản Được Xác Nhận!
            </h1>
            <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed max-w-lg mx-auto">
              Chúc mừng! Yêu cầu thanh toán qua cổng <strong>VNPay</strong> đã được phê duyệt và xác thực an toàn. Chuyến đi của quý khách đã chính thức được bảo lưu.
            </p>

            {/* Chi tiết biên lai thanh toán sang trọng */}
            <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 text-left space-y-4 mb-10">
              <h3 className="font-label-md text-sm text-primary border-b border-outline-variant/20 pb-3 uppercase tracking-wider">
                Chi Tiết Giao Dịch
              </h3>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant flex items-center gap-2">
                  Mã đặt vé (Booking ID):
                </span>
                <span className="font-semibold text-primary">#{bookingId}</span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant flex items-center gap-2">
                  Mã tham chiếu VNPay:
                </span>
                <span className="font-mono text-xs text-on-surface bg-surface border border-outline-variant/10 px-2 py-0.5 rounded">
                  {vnpayTxnRef}
                </span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant flex items-center gap-2">
                  Mã giao dịch cổng:
                </span>
                <span className="font-semibold text-primary">{txnNo}</span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <Building className="h-4 w-4 text-outline" /> Ngân hàng thanh toán:
                </span>
                <span className="font-semibold text-primary">{bankCode}</span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-outline" /> Thời gian giao dịch:
                </span>
                <span className="font-semibold text-primary">{formatVNPayDate(payDate)}</span>
              </div>

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
              Giao dịch thông qua VNPay đã bị hủy bởi người dùng hoặc xảy ra lỗi kết nối với ngân hàng phát hành thẻ. Số tiền của quý khách vẫn chưa bị trừ.
            </p>

            <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 text-left space-y-4 mb-10">
              <h3 className="font-label-md text-sm text-red-600 border-b border-outline-variant/20 pb-3 uppercase tracking-wider">
                Thông Tin Chi Tiết Lỗi
              </h3>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Mã đặt vé liên kết:</span>
                <span className="font-semibold text-primary">#{bookingId}</span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Mã lỗi cổng phản hồi:</span>
                <span className="font-semibold font-mono text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded text-xs">
                  Error Code: {responseCode}
                </span>
              </div>

              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Trạng thái:</span>
                <span className="text-sm text-on-surface-variant italic">Giao dịch bị từ chối hoặc người dùng hủy bỏ</span>
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
                className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 bg-secondary text-on-primary hover:bg-on-secondary-container transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                <RefreshCw className="h-4 w-4" /> Thực Hiện Lại Giao Dịch
              </Link>
            </div>
          </div>
        )}

        {/* Footer bảo mật */}
        <div className="mt-12 flex items-center justify-center gap-3 text-on-surface-variant opacity-60 text-xs border-t border-outline-variant/10 pt-6">
          <ShieldCheck className="h-4.5 w-4.5 text-secondary" />
          <span>Hệ thống WanderVN tích hợp bảo mật tối đa của đối tác VNPay</span>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturn;
