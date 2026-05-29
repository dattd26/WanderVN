import type { AdminHotelListItemDto, HotelReviewStatus } from '../../../../../types';

const STATUS_BADGE: Record<HotelReviewStatus, { label: string; className: string }> = {
  0: {
    label: 'Chờ duyệt',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  1: {
    label: 'Đã duyệt',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  2: {
    label: 'Bị từ chối',
    className: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
};

function formatVietnameseDateTime(iso?: string | null): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('vi-VN', { hour12: false });
}

interface HotelReviewTableProps {
  hotels: AdminHotelListItemDto[];
  isLoading: boolean;
  error: string | null;
  selectedId: number | null;
  onSelectHotel: (id: number) => void;
  pageNumber: number;
  totalPages: number;
  totalItems: number;
  setPageNumber: (page: number | ((p: number) => number)) => void;
  onRetry: () => void;
}

export function HotelReviewTable({
  hotels,
  isLoading,
  error,
  selectedId,
  onSelectHotel,
  pageNumber,
  totalPages,
  totalItems,
  setPageNumber,
  onRetry,
}: HotelReviewTableProps) {
  return (
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
                <div className="flex flex-col items-center gap-admin-sm">
                  <span>Gặp lỗi khi tải dữ liệu: {error}</span>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="px-admin-md py-1 bg-admin-error/10 text-admin-error rounded-lg hover:bg-admin-error/20 transition-colors text-admin-label-caps font-bold"
                  >
                    Thử lại
                  </button>
                </div>
              </td>
            </tr>
          )}
          {!isLoading && !error && hotels.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant text-admin-body-md"
              >
                Không có hồ sơ ở trạng thái này.
              </td>
            </tr>
          )}
          {!isLoading &&
            !error &&
            hotels.map((hotel) => {
              const isSelected = hotel.id === selectedId;
              const badge = STATUS_BADGE[hotel.status];
              const submitted = hotel.submittedAt ?? hotel.createdAt ?? null;
              return (
                <tr
                  key={hotel.id}
                  className={`hover:bg-admin-surface-container-low/50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-admin-surface-container-high/20' : ''
                  }`}
                  onClick={() => onSelectHotel(hotel.id)}
                >
                  <td className="px-admin-lg py-admin-lg">
                    <div className="flex items-center space-x-admin-md">
                      <div className="w-12 h-12 rounded-lg bg-admin-surface-container overflow-hidden">
                        {hotel.primaryImageUrl ? (
                          <img
                            alt={hotel.name}
                            src={hotel.primaryImageUrl}
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
                          {hotel.locationName ?? hotel.address ?? '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-admin-lg py-admin-lg">
                    <p className="text-admin-body-md font-medium">{hotel.ownerName ?? '—'}</p>
                    <p className="text-admin-body-sm text-admin-outline">
                      {hotel.ownerEmail ?? ''}
                    </p>
                  </td>
                  <td className="px-admin-lg py-admin-lg text-admin-body-md text-admin-on-surface-variant">
                    {formatVietnameseDateTime(submitted)}
                  </td>
                  <td className="px-admin-lg py-admin-lg">
                    <span
                      className={`px-2 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider whitespace-nowrap inline-block ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-admin-lg py-admin-lg text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHotel(hotel.id);
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

      {!isLoading && !error && totalPages > 0 && (
        <div className="px-admin-xl py-admin-md bg-admin-surface-bright border-t border-admin-outline-variant flex items-center justify-between select-none">
          <span className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
            Trang <span className="font-bold text-admin-primary">{pageNumber}</span> /{' '}
            <span className="font-bold">{totalPages}</span> &middot;{' '}
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
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
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
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
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
  );
}
