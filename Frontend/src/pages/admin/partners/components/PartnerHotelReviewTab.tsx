import { useMemo, useState, useEffect, useCallback } from 'react';
import { hotelReviewService } from '../../../../services';
import type { HotelReviewDto } from '../../../../services';

type HotelStatus = 'pending' | 'approved' | 'rejected';

const STATUS_TABS: Array<{ key: HotelStatus; label: string }> = [
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Bị từ chối' },
];

const STATUS_BADGE: Record<HotelStatus, { label: string; className: string }> = {
  pending: {
    label: 'Chờ duyệt',
    className: 'bg-admin-secondary-fixed text-admin-on-secondary-fixed-variant',
  },
  approved: {
    label: 'Đã duyệt',
    className: 'bg-admin-surface-container-highest text-admin-on-surface-variant',
  },
  rejected: {
    label: 'Bị từ chối',
    className: 'bg-admin-error/10 text-admin-error',
  },
};

export function PartnerHotelReviewTab() {
  const [activeStatus, setActiveStatus] = useState<HotelStatus>('pending');
  const [hotels, setHotels] = useState<HotelReviewDto[]>([]);
  const [counts, setCounts] = useState<{ pending: number; approved: number; rejected: number }>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Pagination and status states
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusMap: Record<HotelStatus, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  const fetchCounts = useCallback(async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        hotelReviewService.getHotelsReview({ status: 0, pageNumber: 1, pageSize: 1 }),
        hotelReviewService.getHotelsReview({ status: 1, pageNumber: 1, pageSize: 1 }),
        hotelReviewService.getHotelsReview({ status: 2, pageNumber: 1, pageSize: 1 }),
      ]);
      setCounts({
        pending: pendingRes.totalItems,
        approved: approvedRes.totalItems,
        rejected: rejectedRes.totalItems,
      });
    } catch (err) {
      console.error('Lỗi khi tải số lượng hồ sơ:', err);
    }
  }, []);

  const fetchHotels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statusValue = statusMap[activeStatus];
      const result = await hotelReviewService.getHotelsReview({
        status: statusValue,
        pageNumber,
        pageSize,
      });
      setHotels(result.items);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);

      // Auto select first item if list has entries
      if (result.items.length > 0) {
        const hasSelected = result.items.some((h) => h.id === selectedId);
        if (!selectedId || !hasSelected) {
          setSelectedId(result.items[0].id);
        }
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
      setHotels([]);
      setSelectedId(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus, pageNumber, pageSize, selectedId]);

  useEffect(() => {
    fetchHotels();
    fetchCounts();
  }, [activeStatus, pageNumber, pageSize]);

  const filteredHotels = hotels;

  const selectedHotel = useMemo(
    () => hotels.find((h) => h.id === selectedId) ?? null,
    [hotels, selectedId],
  );

  const handleSelectHotel = (id: number) => {
    setSelectedId(id);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!selectedId || !selectedHotel) return;
    if (!window.confirm(`Bạn có chắc chắn muốn duyệt hồ sơ của khách sạn "${selectedHotel.name}"?`)) return;

    setIsLoading(true);
    try {
      await hotelReviewService.approveHotel(selectedId);
      alert(`Đã duyệt hồ sơ "${selectedHotel.name}" thành công!`);
      fetchHotels();
      fetchCounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Duyệt hồ sơ thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedId || !selectedHotel) return;
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn từ chối hồ sơ của khách sạn "${selectedHotel.name}"?`)) return;

    setIsLoading(true);
    try {
      await hotelReviewService.rejectHotel(selectedId, rejectionReason);
      alert(`Đã từ chối hồ sơ "${selectedHotel.name}".`);
      setIsRejecting(false);
      setRejectionReason('');
      fetchHotels();
      fetchCounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Từ chối hồ sơ thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px]">
      <div className="flex-1 flex flex-col p-admin-lg space-y-admin-lg overflow-y-auto">
        <div className="flex items-end justify-between">
          <div>
            <nav className="flex space-x-admin-sm mb-admin-xs text-admin-outline text-admin-body-sm">
              <span>Quản lý đối tác</span>
              <span>/</span>
              <span className="text-admin-primary font-medium">Duyệt hồ sơ khách sạn</span>
            </nav>
            <h2 className="text-admin-display-lg font-admin-sans text-admin-primary">
              Duyệt hồ sơ khách sạn
            </h2>
          </div>
          <button
            type="button"
            className="bg-admin-primary text-admin-on-primary px-admin-lg py-admin-sm rounded-lg flex items-center space-x-admin-sm hover:opacity-90 transition-opacity active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span className="text-admin-label-caps font-admin-sans">Xuất báo cáo</span>
          </button>
        </div>

        <div className="flex space-x-admin-xl border-b border-admin-outline-variant">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveStatus(tab.key);
                  setPageNumber(1);
                }}
                className={`pb-admin-md text-admin-label-caps font-admin-sans transition-colors ${
                  isActive
                    ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
                    : 'text-admin-on-surface-variant hover:text-admin-primary'
                }`}
              >
                {tab.label} ({counts[tab.key]})
              </button>
            );
          })}
        </div>

        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-admin-surface-container-low text-left">
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant">
                  KHÁCH SẠN & VỊ TRÍ
                </th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant">
                  ĐỐI TÁC
                </th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant">
                  NGÀY GỬI
                </th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant">
                  TRẠNG THÁI
                </th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant text-right">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-outline-variant/30">
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant text-admin-body-md"
                  >
                    Đang tải dữ liệu hồ sơ khách sạn...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-admin-lg py-admin-xl text-center text-admin-error text-admin-body-md font-medium"
                  >
                    Gặp lỗi khi tải dữ liệu: {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && filteredHotels.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant text-admin-body-md"
                  >
                    Không có hồ sơ ở trạng thái này.
                  </td>
                </tr>
              )}
              {!isLoading && !error && filteredHotels.map((hotel) => {
                const isSelected = hotel.id === selectedId;
                const badge = STATUS_BADGE[hotel.status];
                return (
                  <tr
                    key={hotel.id}
                    className={`hover:bg-admin-surface-container-low/50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-admin-surface-container-high/20' : ''
                    }`}
                    onClick={() => handleSelectHotel(hotel.id)}
                  >
                    <td className="px-admin-lg py-admin-lg">
                      <div className="flex items-center space-x-admin-md">
                        <div className="w-12 h-12 rounded-lg bg-admin-surface-container overflow-hidden">
                          {hotel.thumbnail ? (
                            <img
                              alt={hotel.name}
                              src={hotel.thumbnail}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-admin-surface-container-high text-admin-outline">
                              <span className="material-symbols-outlined text-[20px]">apartment</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-admin-primary">{hotel.name}</p>
                          <p className="text-admin-body-sm text-admin-on-surface-variant">
                            {hotel.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-admin-lg py-admin-lg">
                      <p className="text-admin-body-md font-medium">{hotel.partnerName}</p>
                      <p className="text-admin-body-sm text-admin-outline">{hotel.partnerCode}</p>
                    </td>
                    <td className="px-admin-lg py-admin-lg text-admin-body-md text-admin-on-surface-variant">
                      {hotel.submittedTime ? hotel.submittedTime.split(' - ')[1] : 'N/A'}
                    </td>
                    <td className="px-admin-lg py-admin-lg">
                      <span
                        className={`px-admin-sm py-1 text-[11px] font-bold rounded-sm uppercase tracking-wider ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-admin-lg py-admin-lg text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHotel(hotel.id);
                        }}
                        className="text-admin-secondary font-bold text-admin-label-caps hover:underline"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Dynamic Pagination Controls */}
          {!isLoading && !error && totalPages > 0 && (
            <div className="px-admin-xl py-admin-md bg-admin-surface-bright border-t border-admin-outline-variant flex items-center justify-between select-none">
              <span className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                Trang{' '}
                <span className="font-bold text-admin-primary">{pageNumber}</span> /{' '}
                <span className="font-bold">{totalPages}</span>
                {' '}&middot;{' '}
                {totalItems.toLocaleString('vi-VN')} kết quả
              </span>
              <div className="flex items-center gap-admin-sm">
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(1)}
                >
                  <span className="material-symbols-outlined">first_page</span>
                </button>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex items-center px-admin-md font-admin-sans">
                  <span className="text-admin-body-sm font-bold text-admin-primary">{pageNumber}</span>
                  <span className="text-admin-body-sm text-admin-on-surface-variant px-admin-md">/</span>
                  <span className="text-admin-body-sm text-admin-on-surface-variant">{totalPages}</span>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber(totalPages)}
                >
                  <span className="material-symbols-outlined">last_page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedHotel && (
        <aside className="w-full lg:w-[480px] bg-admin-surface-container-lowest border-l border-admin-outline-variant flex flex-col shadow-2xl relative z-10">
          <div className="p-admin-lg border-b border-admin-outline-variant flex justify-between items-start">
            <div>
              <h3 className="text-admin-headline-sm font-admin-sans text-admin-primary mb-1">
                Chi tiết hồ sơ
              </h3>
              <p className="text-admin-body-sm text-admin-on-surface-variant flex items-center">
                <span className="material-symbols-outlined text-[16px] mr-1">history</span>
                Gửi lúc: {selectedHotel.submittedTime || 'N/A'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="p-2 hover:bg-admin-surface-container rounded-full text-admin-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-admin-lg space-y-admin-xl">
            <div className="space-y-admin-md">
              <div className="h-48 rounded-xl overflow-hidden bg-admin-surface-container border border-admin-outline-variant">
                {selectedHotel.thumbnail || (selectedHotel.gallery && selectedHotel.gallery.length > 0) ? (
                  <img
                    alt={`${selectedHotel.name} - Ảnh chính`}
                    src={selectedHotel.gallery && selectedHotel.gallery.length > 0 ? selectedHotel.gallery[0] : selectedHotel.thumbnail}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-admin-surface-container text-admin-outline">
                    <span className="material-symbols-outlined text-[48px]">apartment</span>
                  </div>
                )}
              </div>
              {selectedHotel.gallery && selectedHotel.gallery.length > 1 && (
                <div className="grid grid-cols-3 gap-admin-md">
                  {selectedHotel.gallery.slice(1, 3).map((src, idx) => (
                    <div
                      key={src + idx}
                      className="h-20 rounded-lg overflow-hidden border border-admin-outline-variant"
                    >
                      <img
                        alt={`${selectedHotel.name} - Ảnh ${idx + 2}`}
                        src={src}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {selectedHotel.gallery.length > 3 && (
                    <div className="h-20 bg-admin-surface-container-low rounded-lg border border-admin-outline-variant flex flex-col items-center justify-center text-admin-on-surface-variant cursor-pointer hover:bg-admin-surface-container transition-colors">
                      <span className="material-symbols-outlined">add_photo_alternate</span>
                      <span className="text-[10px] font-bold">
                        +{selectedHotel.gallery.length - 3} ảnh
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-admin-md">
              <div>
                <span className="px-admin-sm py-1 bg-admin-primary-container text-admin-on-primary-container text-[10px] font-bold rounded uppercase tracking-widest mb-admin-xs inline-block">
                  {selectedHotel.category}
                </span>
                <h4 className="text-admin-headline-md font-admin-sans text-admin-primary">
                  {selectedHotel.name}
                </h4>
              </div>
              <p className="text-admin-body-md text-admin-on-surface-variant leading-relaxed">
                {selectedHotel.description}
              </p>
              <div className="grid grid-cols-2 gap-admin-md">
                <div className="p-admin-md bg-admin-surface-container-low rounded-lg border border-admin-outline-variant">
                  <p className="text-admin-label-caps font-admin-sans text-admin-outline mb-admin-xs">
                    DIỆN TÍCH
                  </p>
                  <p className="font-bold text-admin-primary">{selectedHotel.area}</p>
                </div>
                <div className="p-admin-md bg-admin-surface-container-low rounded-lg border border-admin-outline-variant">
                  <p className="text-admin-label-caps font-admin-sans text-admin-outline mb-admin-xs">
                    QUY MÔ
                  </p>
                  <p className="font-bold text-admin-primary">{selectedHotel.scale}</p>
                </div>
              </div>
            </div>

            {selectedHotel.status === 'rejected' && selectedHotel.rejectReason && (
              <div className="space-y-admin-xs bg-admin-error/10 p-admin-md rounded-xl border border-admin-error/20">
                <span className="text-admin-label-caps font-admin-sans text-admin-error font-bold block">
                  LÝ DO ĐÃ TỪ CHỐI
                </span>
                <p className="text-admin-body-md text-admin-error font-medium">
                  {selectedHotel.rejectReason}
                </p>
              </div>
            )}

            {selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0 && (
              <div className="space-y-admin-md">
                <h5 className="text-admin-label-caps font-admin-sans text-admin-primary border-b border-admin-outline-variant pb-admin-xs">
                  LOẠI PHÒNG ĐĂNG KÝ
                </h5>
                <div className="space-y-admin-sm">
                  {selectedHotel.roomTypes.map((room) => (
                    <div
                      key={room.name}
                      className="flex items-center justify-between p-admin-md border border-admin-outline-variant rounded-lg"
                    >
                      <div className="flex items-center space-x-admin-md">
                        <span className="material-symbols-outlined text-admin-secondary">
                          {room.icon}
                        </span>
                        <div>
                          <p className="font-bold text-admin-primary">{room.name}</p>
                          <p className="text-admin-body-sm text-admin-outline">{room.summary}</p>
                        </div>
                      </div>
                      <p className="font-bold text-admin-secondary">{room.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isRejecting && (
              <div className="space-y-admin-md bg-admin-error/10 p-admin-md rounded-xl border border-admin-error/20">
                <label
                  htmlFor="rejection-reason"
                  className="text-admin-label-caps font-admin-sans text-admin-error font-bold block"
                >
                  LÝ DO TỪ CHỐI *
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder="Nhập lý do cụ thể để đối tác điều chỉnh..."
                  className="w-full rounded-lg border border-admin-outline-variant bg-white text-admin-body-md focus:ring-2 focus:ring-admin-error focus:border-admin-error p-admin-sm"
                />
              </div>
            )}
          </div>

          {selectedHotel.status === 'pending' && (
            <div className="p-admin-lg bg-admin-surface-container-low border-t border-admin-outline-variant">
              {!isRejecting ? (
                <div className="flex space-x-admin-md">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(true)}
                    className="flex-1 px-admin-lg py-admin-md border border-admin-error text-admin-error font-bold rounded-lg hover:bg-admin-error/5 transition-colors active:scale-95 text-admin-label-caps font-admin-sans"
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="flex-[2] px-admin-lg py-admin-md bg-admin-primary-container text-admin-on-primary-container font-bold rounded-lg hover:opacity-90 transition-opacity active:scale-95 text-admin-label-caps font-admin-sans"
                  >
                    Duyệt hồ sơ
                  </button>
                </div>
              ) : (
                <div className="flex space-x-admin-md">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRejecting(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-admin-lg py-admin-md border border-admin-outline text-admin-outline font-bold rounded-lg hover:bg-admin-surface-container-highest transition-colors text-admin-label-caps font-admin-sans"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="flex-[2] px-admin-lg py-admin-md bg-admin-error text-admin-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity text-admin-label-caps font-admin-sans"
                  >
                    Xác nhận từ chối
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
