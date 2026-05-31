import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Star,
  MapPin,
  BedDouble,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { PartnerHeader } from '../../components/partner/PartnerHeader';
import { PartnerSidebar } from '../../components/partner/PartnerSidebar';
import { partnerService } from '../../services';
import type { PartnerHotelDto } from '../../types';
import { DashboardCardSkeleton } from '../../components/ui/DashboardCardSkeleton';

export const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // ── Khởi tạo các state quản lý dữ liệu và UI ──
  const [allHotels, setAllHotels] = useState<PartnerHotelDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // ── Tải danh sách khách sạn của đối tác từ API khi component mount ──
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await partnerService.getMyHotels(1, 100);
        setAllHotels(data.items || []);
      } catch (err: unknown) {
        console.error('Error fetching partner hotels:', err);
        const errorMessage = err instanceof Error ? err.message : 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // ── Tính toán các số liệu thống kê tổng quan (Dashboard Metrics) ──
  const stats = useMemo(() => {
    const total = allHotels.length;
    const pending = allHotels.filter(h => h.status === 0).length;
    const approved = allHotels.filter(h => h.status === 1).length;
    const rejected = allHotels.filter(h => h.status === 2).length;
    const activeBookings = allHotels.reduce((sum, h) => sum + h.totalBookings, 0);

    return { total, pending, approved, rejected, activeBookings };
  }, [allHotels]);

  // ── Lọc danh sách khách sạn hiển thị theo tab được chọn ở client-side ──
  const filteredHotels = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return allHotels.filter(h => h.status === 0);
      case 'approved':
        return allHotels.filter(h => h.status === 1);
      case 'rejected':
        return allHotels.filter(h => h.status === 2);
      default:
        return allHotels;
    }
  }, [allHotels, activeTab]);

  // ── Định dạng hiển thị ngày tháng chuẩn Việt Nam ──
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // ── Trình dựng giao diện trạng thái tải dữ liệu (Pulse Skeletons) ──
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((idx) => (
        <DashboardCardSkeleton key={idx} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex font-body-md text-[#1C1C19] relative">
      {/* Sidebar cố định bên trái */}
      <PartnerSidebar hotelName={allHotels[0]?.name || 'Hanoi Boutique Hotel'} />

      {/* Vùng nội dung chính bên phải */}
      <div className="flex-grow flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Header tối giản dành riêng cho luồng quản lý của Partner */}
        <PartnerHeader exitTo="/" />

        <main className="flex-1 w-full max-w-[1200px] mx-auto px-margin-mobile md:px-gutter py-10 md:py-14 space-y-10 z-10">

          {/* Tiêu đề trang phong cách tạp chí cao cấp (EB Garamond Serif) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-outline-variant/40">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-[#1C1C19] leading-tight">
                Bảng điều khiển đối tác
              </h1>
              <p className="font-body-md text-[#444748] leading-relaxed">
                Chào mừng quý đối tác đến với cổng quản trị lưu trú WanderVN. Theo dõi tổng doanh thu đối soát, quản lý các cơ sở lưu trú và cập nhật tình trạng booking trực tiếp từ đây.
              </p>
            </div>
            <button
              onClick={() => navigate('/partner/onboarding')}
              className="font-label-md text-label-md uppercase tracking-widest bg-[#1C1C19] text-[#FAF6F0] px-6 py-3.5 rounded-lg shadow-md hover:bg-secondary hover:text-on-secondary transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              Đăng ký cơ sở mới
            </button>
          </div>

          {/* ── Bảng Thống kê Hiệu năng (Dashboard Metrics) ── */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 limestone-shadow flex items-center gap-5 transition-transform duration-300 hover:translate-y-[-2px]">
              <div className="p-4 rounded-xl bg-surface-container text-primary">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="space-y-0.5">
                <span className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant">Tổng cơ sở lưu trú</span>
                <div className="font-display-lg text-[28px] font-semibold text-primary">{stats.total}</div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 limestone-shadow flex items-center gap-5 transition-transform duration-300 hover:translate-y-[-2px]">
              <div className="p-4 rounded-xl bg-secondary-container/30 text-secondary">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <div className="space-y-0.5">
                <span className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant">Tổng lượt đặt phòng hoạt động</span>
                <div className="font-display-lg text-[28px] font-semibold text-secondary">{stats.activeBookings}</div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 limestone-shadow flex items-center gap-5 transition-transform duration-300 hover:translate-y-[-2px]">
              <div className="p-4 rounded-xl bg-error-container/30 text-error">
                <Clock className="h-7 w-7" />
              </div>
              <div className="space-y-0.5">
                <span className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant">Cơ sở chờ duyệt</span>
                <div className="font-display-lg text-[28px] font-semibold text-error">{stats.pending}</div>
              </div>
            </div>

          </section>

          {/* ── Tabs Bộ lọc Trạng thái kiểm duyệt (Glassmorphism Tabs) ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
            <div className="flex flex-wrap gap-2 bg-surface-container/60 p-1.5 rounded-xl border border-outline-variant/40 backdrop-blur-md">

              <button
                onClick={() => setActiveTab('all')}
                className={`font-label-md text-caption uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all duration-200 ${activeTab === 'all'
                    ? 'bg-surface text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface/40'
                  }`}
              >
                Tất cả ({stats.total})
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`font-label-md text-caption uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2.5 ${activeTab === 'pending'
                    ? 'bg-surface text-secondary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface/40'
                  }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Chờ duyệt ({stats.pending})
              </button>

              <button
                onClick={() => setActiveTab('approved')}
                className={`font-label-md text-caption uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2.5 ${activeTab === 'approved'
                    ? 'bg-surface text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface/40'
                  }`}
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Đã hoạt động ({stats.approved})
              </button>

              <button
                onClick={() => setActiveTab('rejected')}
                className={`font-label-md text-caption uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2.5 ${activeTab === 'rejected'
                    ? 'bg-surface text-error shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-error hover:bg-surface/40'
                  }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                Bị từ chối ({stats.rejected})
              </button>

            </div>
          </div>

          {/* ── Phần thân chính: Danh sách khách sạn hoặc Trạng thái Loading/Lỗi/Rỗng ── */}
          {loading ? (
            renderSkeletons()
          ) : error ? (
            <div className="bg-error-container/20 border border-error/30 rounded-xl p-8 text-center space-y-4 max-w-xl mx-auto limestone-shadow">
              <AlertCircle className="h-12 w-12 text-error mx-auto" />
              <h3 className="font-headline-md text-headline-md text-primary">Đã xảy ra lỗi tải dữ liệu</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="font-label-md text-label-md uppercase tracking-wider bg-primary text-on-primary px-6 py-2.5 rounded hover:bg-secondary hover:text-on-secondary transition-colors"
              >
                Tải lại trang
              </button>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-surface border border-outline-variant/40 rounded-xl p-12 text-center space-y-6 max-w-xl mx-auto limestone-shadow animate-fade-up">
              <Building2 className="h-16 w-16 text-outline-variant/80 mx-auto" />
              <div className="space-y-2">
                <h3 className="font-headline-md text-headline-md text-primary">Không tìm thấy cơ sở lưu trú nào</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {activeTab === 'all'
                    ? 'Bạn chưa đăng ký cơ sở lưu trú nào trên WanderVN. Hãy đăng ký khách sạn đầu tiên của bạn để tiếp cận hàng triệu du khách!'
                    : 'Không có khách sạn nào khớp với trạng thái lọc hiện tại.'}
                </p>
              </div>
              {activeTab === 'all' && (
                <button
                  onClick={() => navigate('/partner/onboarding')}
                  className="font-label-md text-label-md uppercase tracking-widest bg-primary text-on-primary px-8 py-3 rounded-lg shadow hover:bg-secondary hover:text-on-secondary transition-all"
                >
                  Bắt đầu đăng ký ngay
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
              {filteredHotels.map((hotel) => {
                // ── Xác định màu sắc, nhãn hiển thị cho từng trạng thái phê duyệt ──
                let statusLabel = 'Chờ duyệt';
                let statusClass = 'bg-secondary-container/40 text-on-secondary-container border border-secondary/30';
                let StatusIcon = Clock;

                if (hotel.status === 1) {
                  statusLabel = 'Đang hoạt động';
                  statusClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                  StatusIcon = CheckCircle;
                } else if (hotel.status === 2) {
                  statusLabel = 'Từ chối duyệt';
                  statusClass = 'bg-error-container text-on-error-container border border-error/20';
                  StatusIcon = XCircle;
                }

                return (
                  <article
                    key={hotel.id}
                    className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden limestone-shadow flex flex-col group hover:shadow-lg transition-all duration-300"
                  >

                    {/* Container Ảnh đại diện khách sạn */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                      {hotel.primaryImageUrl ? (
                        <img
                          src={hotel.primaryImageUrl}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-surface-container to-surface p-6 text-center text-on-surface-variant/40">
                          <Building2 className="h-10 w-10 mb-2" />
                          <span className="font-caption text-[11px] uppercase tracking-wider">Chưa tải ảnh lên</span>
                        </div>
                      )}

                      {/* Trạng thái duyệt đính nổi trên góc ảnh */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-[10px] uppercase tracking-widest ${statusClass} backdrop-blur-md`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabel}
                        </span>
                      </div>

                      {/* Badge loại hình khách sạn ở góc phải */}
                      {hotel.propertyTypeName && (
                        <div className="absolute top-4 right-4 z-20">
                          <span className="inline-block bg-primary/80 text-on-primary px-2.5 py-1 rounded font-label-md text-[9px] uppercase tracking-wider backdrop-blur-sm">
                            {hotel.propertyTypeName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Nội dung chi tiết thông tin */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">

                        {/* Tiêu đề & Hạng sao */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                            ))}
                          </div>
                          <h3 className="font-headline-md text-headline-md text-primary leading-snug group-hover:text-secondary transition-colors line-clamp-1">
                            {hotel.name}
                          </h3>
                        </div>

                        {/* Địa chỉ cơ sở */}
                        {hotel.address && (
                          <div className="flex items-start gap-1.5 text-on-surface-variant font-caption text-caption">
                            <MapPin className="h-4 w-4 text-outline shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">
                              {hotel.address}{hotel.locationName ? `, ${hotel.locationName}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Thông tin mô tả rút gọn */}
                        {hotel.description && (
                          <p className="text-on-surface-variant font-body-md text-caption line-clamp-2 leading-relaxed pt-1">
                            {hotel.description}
                          </p>
                        )}
                      </div>

                      {/* ── Phần chân thẻ: Chi tiết các chỉ số phòng và đặt phòng ── */}
                      <div className="space-y-4 pt-4 border-t border-outline-variant/30">

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <BedDouble className="h-4.5 w-4.5 text-secondary" />
                            <div className="leading-tight">
                              <div className="font-label-md text-[10px] uppercase tracking-wider text-outline">Loại phòng</div>
                              <span className="font-body-md text-caption font-semibold text-primary">{hotel.roomTypeCount} loại đã khai báo</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <CalendarCheck className="h-4.5 w-4.5 text-secondary" />
                            <div className="leading-tight">
                              <div className="font-label-md text-[10px] uppercase tracking-wider text-outline">Lượt đặt</div>
                              <span className="font-body-md text-caption font-semibold text-primary">{hotel.totalBookings} đơn hoạt động</span>
                            </div>
                          </div>
                        </div>

                        {/* Thời điểm gửi duyệt */}
                        <div className="font-caption text-[11px] text-on-surface-variant/80 flex justify-between items-center bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/20">
                          <span>Ngày tạo hồ sơ:</span>
                          <span className="font-semibold">{formatDate(hotel.submittedAt || hotel.createdAt)}</span>
                        </div>

                        {/* Hiển thị lý do từ chối duyệt nếu trạng thái bị Rejected */}
                        {hotel.status === 2 && hotel.rejectReason && (
                          <div className="bg-error-container/20 border border-error/30 rounded-lg p-3.5 space-y-1.5 text-left">
                            <div className="flex items-center gap-2 text-error font-label-md text-[11px] uppercase tracking-wider">
                              <AlertTriangle className="h-4 w-4" />
                              Lý do bị từ chối:
                            </div>
                            <p className="font-body-md text-caption text-error font-medium leading-relaxed">
                              {hotel.rejectReason}
                            </p>
                            <div className="font-caption text-[10px] text-on-surface-variant/75 italic pt-1">
                              * Vui lòng liên hệ Admin WanderVN để nhận trợ giúp sửa đổi thông tin.
                            </div>
                          </div>
                        )}

                        {/* Các nút hành động chính */}
                        <div className="pt-2 flex items-center gap-2">
                          {hotel.status === 1 ? (
                            <a
                              href={`/hotel/${hotel.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 font-label-md text-caption uppercase tracking-wider border border-outline hover:border-primary text-primary px-3 py-2.5 rounded text-center transition-all duration-200 flex items-center justify-center gap-1.5 hover:bg-surface-container"
                            >
                              Xem trên web
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex-1 font-label-md text-caption uppercase tracking-wider border border-outline-variant/30 text-outline-variant/60 px-3 py-2.5 rounded cursor-not-allowed text-center flex items-center justify-center gap-1.5"
                              title="Chỉ khả dụng khi khách sạn đã được duyệt hoạt động"
                            >
                              Chưa hoạt động
                            </button>
                          )}

                          <button
                            onClick={() => {
                              // TODO: Di chuyển tới màn hình quản lý đặt phòng, loại phòng chi tiết
                              alert('Tính năng Quản lý chi tiết đang được phát triển ở giai đoạn kế tiếp!');
                            }}
                            className="flex-grow-[1.5] font-label-md text-caption uppercase tracking-widest bg-primary text-on-primary px-3 py-2.5 rounded hover:bg-secondary hover:text-on-secondary transition-colors flex items-center justify-center gap-1.5"
                          >
                            Quản lý cơ sở
                          </button>
                        </div>

                      </div>

                    </div>

                  </article>
                );
              })}
            </div>
          )}

        </main>

        {/* Lớp phủ họa tiết nhiễu đá vôi phong cách luxury đặc trưng */}
        <div className="texture-overlay" />
      </div>
    </div>
  );
};

export default PartnerDashboard;
