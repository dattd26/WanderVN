import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plane, Clock, User, Calendar, MapPin, CreditCard, ChevronLeft } from 'lucide-react';
import type { BookingHistoryDto } from '../../types';

export default function BookingDetail() {
  const { bookingId } = useParams(); 
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingHistoryDto | null>(null);
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
          setError(resData.message || "Không thể tải thông tin đơn đặt hàng.");
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
    const serviceName = booking?.serviceType === 'Flight' ? 'vé máy bay' : 'phòng khách sạn';
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn đặt ${serviceName} này không?`)) return;
    
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
        alert(`Hủy ${serviceName} thành công!`);
      } else {
        alert(resData.message || "Có lỗi xảy ra khi hủy đơn.");
      }
    } catch (error: unknown) {
      console.error("Lỗi hủy đơn:", error);
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

  const isFlight = booking.serviceType === 'Flight';

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-12 px-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
              {isFlight ? 'Nhật ký chuyến bay' : 'Nhật ký lưu trú'}
            </span>
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
          {isFlight ? (
            /* --- FLIGHT BOOKING DETAILS --- */
            <>
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-800 mb-5">Thông tin chuyến bay</h2>
                <div className="border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-center rounded-lg shadow-sm">
                  
                  {/* Airline Logo */}
                  <div className="w-full md:w-32 h-32 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center p-3">
                    {booking.flightDetails?.airlineLogo ? (
                      <img 
                        src={booking.flightDetails.airlineLogo} 
                        alt={booking.flightDetails.airlineName} 
                        className="w-full h-auto object-contain" 
                      />
                    ) : (
                      <Plane className="h-10 w-10 text-gray-300" />
                    )}
                  </div>

                  {/* Flight Info & Route */}
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded font-semibold mb-1">
                        <Plane className="h-3.5 w-3.5" /> Chuyến bay {booking.flightDetails?.flightNumber}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-gray-900">{booking.flightDetails?.airlineName}</h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-700 bg-neutral-50 p-3 rounded-lg border">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-900 text-lg">{booking.flightDetails?.depAirportCode}</span>
                        <span className="text-xs text-gray-500">{booking.flightDetails?.depAirportCity}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center px-2">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Bay thẳng</span>
                        <div className="w-full relative flex items-center justify-center">
                          <div className="w-full h-px bg-gray-300"></div>
                          <Plane className="h-4 w-4 text-gray-400 absolute bg-neutral-50 px-0.5 -rotate-90" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-900 text-lg">{booking.flightDetails?.arrAirportCode}</span>
                        <span className="text-xs text-gray-500">{booking.flightDetails?.arrAirportCity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Schedules */}
                  <div className="w-full md:w-auto flex justify-between gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Khởi hành</p>
                      <p className="font-bold text-amber-900 text-base flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-700" /> {booking.flightDetails?.depTime || '---'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Đến nơi</p>
                      <p className="font-bold text-gray-700 text-base flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gray-500" /> {booking.flightDetails?.arrTime || '---'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Passengers Section */}
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-800 mb-5">Danh sách hành khách</h2>
                <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-wider">
                        <th className="p-4">#</th>
                        <th className="p-4">Hành khách</th>
                        <th className="p-4">Số hộ chiếu</th>
                        <th className="p-4 text-right">Số ghế</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.flightDetails?.passengers && booking.flightDetails.passengers.length > 0 ? (
                        booking.flightDetails.passengers.map((pax, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-neutral-50/50 transition-colors">
                            <td className="p-4 text-gray-400 font-medium">{i + 1}</td>
                            <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" /> {pax.passengerName}
                            </td>
                            <td className="p-4 font-mono text-gray-600">{pax.passportNumber || 'N/A'}</td>
                            <td className="p-4 font-mono font-bold text-blue-600 text-right">{pax.seatNumber || 'Chưa chọn'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                            Chưa cập nhật danh sách hành khách.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            /* --- HOTEL BOOKING DETAILS --- */
            <>
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-800 mb-5">Thông tin lưu trú</h2>
                <div className="border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-center rounded-lg shadow-sm">
                  
                  {/* Hotel Image */}
                  <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {booking.hotelDetails?.hotelImage ? (
                      <img 
                        src={booking.hotelDetails.hotelImage} 
                        alt={booking.hotelDetails.hotelName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Không có ảnh</div>
                    )}
                  </div>

                  {/* Hotel Info */}
                  <div className="flex-1 w-full space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-gray-900">{booking.hotelDetails?.hotelName}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">📍 {booking.hotelDetails?.hotelAddress}</p>
                    <div className="pt-3">
                      <p className="text-sm text-gray-600">Hạng phòng: <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{booking.hotelDetails?.roomTypeName}</span></p>
                    </div>
                  </div>

                  {/* Checkin/Checkout Dates */}
                  <div className="w-full md:w-auto flex justify-between gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày nhận phòng</p>
                      <p className="font-bold text-amber-900 text-lg flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-amber-700" />
                        {booking.hotelDetails?.checkInDate ? new Date(booking.hotelDetails.checkInDate).toLocaleDateString('vi-VN') : '---'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày trả phòng</p>
                      <p className="font-bold text-gray-700 text-lg flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {booking.hotelDetails?.checkOutDate ? new Date(booking.hotelDetails.checkOutDate).toLocaleDateString('vi-VN') : '---'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Pricing Details */}
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-800 mb-5">Chi tiết giao dịch</h2>
            <div className="bg-amber-50/50 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-center border border-amber-100/50">
              <p className="text-sm font-medium text-gray-600 mb-2 sm:mb-0 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-amber-700" /> Tổng chi phí:
              </p>
              <div className="text-2xl font-black text-amber-700">
                {booking.totalPrice?.toLocaleString('vi-VN')} <span className="text-sm font-bold">VND</span>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons Section */}
        <div className="px-8 py-5 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <button 
            onClick={() => navigate('/booking-history')} 
            className="text-xs font-bold text-gray-500 hover:text-amber-700 transition-colors tracking-wide uppercase order-2 sm:order-1 flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Quay lại lịch sử
          </button>
          
          <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
              <button 
                onClick={handleCancelBooking} 
                disabled={isProcessing} 
                className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold uppercase tracking-wider text-red-600 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Đang xử lý...' : (isFlight ? 'Hủy đặt vé' : 'Hủy phòng')}
              </button>
            )}

            {!isFlight && (booking.status === 'Paid' || booking.status === 'Pending') && (
              <button 
                onClick={handleCheckOut} 
                disabled={isProcessing} 
                className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận trả phòng'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}