import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface HotelBookingDetail {
  bookingId: number;
  bookingCode: string;
  hotelId: number;
  hotelName: string;
  hotelAddress: string;
  hotelImage: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function BookingDetail() {
  const { bookingId } = useParams(); 
  const navigate = useNavigate();
  const [booking, setBooking] = useState<HotelBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5096/api/v1';
  console.log("API URL thực tế hệ thống nhận được:", apiUrl);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!bookingId) return;

    const fetchBookingDetail = async () => {
      try {
        const response = await fetch(`${apiUrl}/bookings/${bookingId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Lỗi hệ thống: mã trạng thái ${response.status}`);
        }

        const resData = await response.json();

        if (resData.success) {
          setBooking(resData.data);
        } else {
          setError(resData.message || "Không thể tải thông tin đơn đặt phòng.");
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết:", error);
        setError("Không thể kết nối đến máy chủ Back-end. Anh hãy kiểm tra xem API đã bật chưa nhé!");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId, apiUrl, token]);

  const handleCancelBooking = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này không?")) return;
    
    try {
      setIsProcessing(true);
      const response = await fetch(`${apiUrl}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setBooking(prev => prev ? { ...prev, status: 'Cancelled' } : null);
        alert("Hủy phòng thành công!");
      } else {
        alert(resData.message || "Có lỗi xảy ra khi hủy phòng.");
      }
    } catch (error: unknown) {
      console.error("Lỗi hủy phòng:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!window.confirm("Xác nhận bạn đã trả phòng và kết thúc hành trình?")) return;
    
    try {
      setIsProcessing(true);
      const response = await fetch(`${apiUrl}/bookings/${bookingId}/checkout`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setBooking(prev => prev ? { ...prev, status: 'Completed' } : null);
        alert("Xác nhận trả phòng thành công!");
      } else {
        alert(resData.message || "Có lỗi xảy ra khi xác nhận trả phòng.");
      }
    } catch (error: unknown) {
      console.error("Lỗi xác nhận trả phòng:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-gray-500 text-center max-w-md p-4 font-medium bg-white rounded-lg shadow-sm border border-red-100">
          Không tìm thấy mã hóa đơn hợp lệ trên đường dẫn.
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><div className="animate-pulse text-amber-700 font-serif text-xl tracking-widest">Đang tìm kiếm hành trình...</div></div>;
  if (error || !booking) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><div className="text-gray-500 text-center max-w-md p-4 font-medium bg-white rounded-lg shadow-sm border border-red-100">{error || "Hóa đơn không tồn tại."}</div></div>;

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <span className="px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">● Đã hoàn thành</span>;
      case 'Cancelled': return <span className="px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-full bg-red-50 text-red-700 border border-red-100">● Đã hủy</span>;
      case 'Paid': return <span className="px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">● Đã thanh toán</span>;
      default: return <span className="px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100">● Đang xử lý</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-12 px-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Nhật ký hành trình</span>
            <h1 className="text-3xl font-serif text-gray-900 mt-2 mb-1">Chi Tiết Đơn Đặt</h1>
            <p className="text-xs text-gray-500">Mã đơn: <span className="font-bold text-gray-900">{booking.bookingCode}</span></p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            {renderStatusBadge(booking.status)}
            <p className="text-[11px] text-gray-400">Đặt ngày: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-10">
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-800 mb-5">Thông tin dịch vụ</h2>
            <div className="border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-center rounded-lg shadow-sm">
              
              {/* Thêm phần hiển thị ảnh Khách sạn */}
              <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {booking.hotelImage ? (
                  <img src={booking.hotelImage} alt={booking.hotelName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Không có ảnh</div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <h3 className="font-serif text-2xl font-bold text-gray-900">{booking.hotelName}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">📍 {booking.hotelAddress}</p>
                <div className="pt-3">
                  <p className="text-sm text-gray-600">Hạng phòng: <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{booking.roomTypeName}</span></p>
                </div>
              </div>

              <div className="w-full md:w-auto flex justify-between gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 text-sm">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày nhận phòng</p>
                  <p className="font-bold text-amber-900 text-lg">{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('vi-VN') : '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày trả phòng</p>
                  <p className="font-bold text-gray-700 text-lg">{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('vi-VN') : '---'}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-800 mb-5">Chi tiết giao dịch</h2>
            <div className="bg-amber-50/50 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-center border border-amber-100/50">
              <p className="text-sm font-medium text-gray-600 mb-2 sm:mb-0">Tổng chi phí:</p>
              <div className="text-2xl font-black text-amber-700">
                {booking.totalPrice?.toLocaleString('vi-VN')} <span className="text-sm font-bold">VND</span>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons Section */}
        <div className="px-8 py-5 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <button onClick={() => navigate('/booking-history')} className="text-xs font-bold text-gray-500 hover:text-amber-700 transition-colors tracking-wide uppercase order-2 sm:order-1">
            ← Quay lại lịch sử
          </button>
          
          <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
              <button onClick={handleCancelBooking} disabled={isProcessing} className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold uppercase tracking-wider text-red-600 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700 transition-all disabled:opacity-50">
                {isProcessing ? 'Đang xử lý...' : 'Hủy phòng'}
              </button>
            )}

            {(booking.status === 'Paid' || booking.status === 'Pending') && (
              <button onClick={handleCheckOut} disabled={isProcessing} className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50">
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận trả phòng'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}