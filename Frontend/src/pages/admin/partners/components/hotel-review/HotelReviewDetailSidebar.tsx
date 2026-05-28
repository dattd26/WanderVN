import type { AdminHotelDetailDto } from '../../../../../types';

function formatVietnameseDateTime(iso?: string | null): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('vi-VN', { hour12: false });
}

function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

interface HotelReviewDetailSidebarProps {
  detail: AdminHotelDetailDto;
  isLoadingDetail: boolean;
  onClose: () => void;
  onApprove: () => void;
  onRejectConfirm: () => void;
  isSubmittingAction: boolean;
  isRejecting: boolean;
  setIsRejecting: (val: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (val: string) => void;
  actionError: string | null;
  setActionError: (val: string | null) => void;
}

export function HotelReviewDetailSidebar({
  detail,
  isLoadingDetail,
  onClose,
  onApprove,
  onRejectConfirm,
  isSubmittingAction,
  isRejecting,
  setIsRejecting,
  rejectionReason,
  setRejectionReason,
  actionError,
  setActionError,
}: HotelReviewDetailSidebarProps) {
  return (
    <aside className="w-full lg:w-[480px] bg-admin-surface-container-lowest border-l border-admin-outline-variant flex flex-col shadow-2xl relative z-10">
      <div className="p-admin-lg border-b border-admin-outline-variant flex justify-between items-start">
        <div>
          <h3 className="text-admin-headline-sm font-admin-sans text-admin-primary mb-1">
            Chi tiết hồ sơ
          </h3>
          <p className="text-admin-body-sm text-admin-on-surface-variant flex items-center">
            <span className="material-symbols-outlined text-[16px] mr-1">history</span>
            Gửi lúc: {formatVietnameseDateTime(detail?.submittedAt ?? detail?.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-admin-surface-container rounded-full text-admin-on-surface-variant"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-admin-lg space-y-admin-xl">
        {isLoadingDetail && (
          <div className="text-center text-admin-on-surface-variant py-admin-xl">
            Đang tải chi tiết hồ sơ...
          </div>
        )}

        {!isLoadingDetail && detail && (
          <>
            <div className="space-y-admin-md">
              <div className="h-48 rounded-xl overflow-hidden bg-admin-surface-container border border-admin-outline-variant">
                {detail.imageUrls && detail.imageUrls.length > 0 ? (
                  <img
                    alt={`${detail.name} - Ảnh chính`}
                    src={detail.imageUrls[0]}
                    className="w-full h-full object-cover"
                  />
                ) : detail.primaryImageUrl ? (
                  <img
                    alt={`${detail.name} - Ảnh chính`}
                    src={detail.primaryImageUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-admin-surface-container text-admin-outline">
                    <span className="material-symbols-outlined text-[48px]">apartment</span>
                  </div>
                )}
              </div>
              {detail.imageUrls && detail.imageUrls.length > 1 && (
                <div className="grid grid-cols-3 gap-admin-md">
                  {detail.imageUrls.slice(1, 4).map((src, idx) => (
                    <div
                      key={src + idx}
                      className="h-20 rounded-lg overflow-hidden border border-admin-outline-variant"
                    >
                      <img
                        alt={`${detail.name} - Ảnh ${idx + 2}`}
                        src={src}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {detail.imageUrls.length > 4 && (
                    <div className="h-20 bg-admin-surface-container-low rounded-lg border border-admin-outline-variant flex flex-col items-center justify-center text-admin-on-surface-variant">
                      <span className="material-symbols-outlined">add_photo_alternate</span>
                      <span className="text-[10px] font-bold">
                        +{detail.imageUrls.length - 4} ảnh
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-admin-md">
              {detail.propertyTypeName && (
                <span className="px-admin-sm py-1 bg-admin-primary-container text-admin-on-primary-container text-[10px] font-bold rounded uppercase tracking-widest mb-admin-xs inline-block">
                  {detail.propertyTypeName}
                </span>
              )}
              <h4 className="text-admin-headline-md font-admin-sans text-admin-primary">
                {detail.name}
              </h4>
              {detail.address && (
                <p className="text-admin-body-sm text-admin-on-surface-variant flex items-center">
                  <span className="material-symbols-outlined text-[16px] mr-1">place</span>
                  {detail.address}
                  {detail.locationName ? ` · ${detail.locationName}` : ''}
                </p>
              )}
              {detail.description && (
                <p className="text-admin-body-md text-admin-on-surface-variant leading-relaxed whitespace-pre-line">
                  {detail.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-admin-md">
                <div className="p-admin-md bg-admin-surface-container-low rounded-lg border border-admin-outline-variant">
                  <p className="text-admin-label-caps font-admin-sans text-admin-outline mb-admin-xs">
                    XẾP HẠNG
                  </p>
                  <p className="font-bold text-admin-primary">
                    {detail.starRating ? `${detail.starRating} sao` : '—'}
                  </p>
                </div>
                <div className="p-admin-md bg-admin-surface-container-low rounded-lg border border-admin-outline-variant">
                  <p className="text-admin-label-caps font-admin-sans text-admin-outline mb-admin-xs">
                    LOẠI HÌNH
                  </p>
                  <p className="font-bold text-admin-primary">
                    {detail.propertyTypeName ?? '—'}
                  </p>
                </div>
              </div>
              <div className="p-admin-md bg-admin-surface-container-low rounded-lg border border-admin-outline-variant space-y-1">
                <p className="text-admin-label-caps font-admin-sans text-admin-outline">ĐỐI TÁC</p>
                <p className="font-bold text-admin-primary">{detail.ownerName ?? '—'}</p>
                {detail.ownerEmail && (
                  <p className="text-admin-body-sm text-admin-on-surface-variant">
                    {detail.ownerEmail}
                  </p>
                )}
                {detail.ownerPhone && (
                  <p className="text-admin-body-sm text-admin-on-surface-variant">
                    {detail.ownerPhone}
                  </p>
                )}
              </div>
              {detail.cancellationPolicy && (
                <div className="p-admin-md bg-admin-surface-container-low rounded-lg border border-admin-outline-variant">
                  <p className="text-admin-label-caps font-admin-sans text-admin-outline mb-admin-xs">
                    CHÍNH SÁCH HỦY
                  </p>
                  <p className="text-admin-body-md text-admin-primary whitespace-pre-line">
                    {detail.cancellationPolicy}
                  </p>
                </div>
              )}
            </div>

            {detail.status === 1 && detail.approvedAt && (
              <div className="space-y-admin-xs bg-admin-primary-container/30 p-admin-md rounded-xl border border-admin-primary-container">
                <span className="text-admin-label-caps font-admin-sans text-admin-primary font-bold block">
                  ĐÃ DUYỆT
                </span>
                <p className="text-admin-body-md text-admin-primary font-medium">
                  Lúc {formatVietnameseDateTime(detail.approvedAt)}
                </p>
              </div>
            )}

            {detail.status === 2 && detail.rejectReason && (
              <div className="space-y-admin-xs bg-admin-error/10 p-admin-md rounded-xl border border-admin-error/20">
                <span className="text-admin-label-caps font-admin-sans text-admin-error font-bold block">
                  LÝ DO ĐÃ TỪ CHỐI
                </span>
                <p className="text-admin-body-md text-admin-error font-medium whitespace-pre-line">
                  {detail.rejectReason}
                </p>
              </div>
            )}

            {detail.roomTypes && detail.roomTypes.length > 0 && (
              <div className="space-y-admin-md">
                <h5 className="text-admin-label-caps font-admin-sans text-admin-primary border-b border-admin-outline-variant pb-admin-xs">
                  LOẠI PHÒNG ĐĂNG KÝ
                </h5>
                <div className="space-y-admin-sm">
                  {detail.roomTypes.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-admin-md border border-admin-outline-variant rounded-lg"
                    >
                      <div className="flex items-center space-x-admin-md">
                        <span className="material-symbols-outlined text-admin-secondary">
                          bed
                        </span>
                        <div>
                          <p className="font-bold text-admin-primary">{room.name}</p>
                          <p className="text-admin-body-sm text-admin-outline">
                            Sức chứa {room.capacity} · {room.totalRooms} phòng
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-admin-secondary">
                        {formatVnd(room.basePrice)}
                      </p>
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
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (actionError) setActionError(null);
                  }}
                  rows={3}
                  autoFocus
                  placeholder="Nhập lý do cụ thể để đối tác điều chỉnh..."
                  className="w-full rounded-lg border border-admin-outline-variant bg-white text-admin-body-md focus:ring-2 focus:ring-admin-error focus:border-admin-error p-admin-sm"
                />
              </div>
            )}

            {actionError && (
              <p className="text-admin-error text-admin-body-sm font-medium">{actionError}</p>
            )}
          </>
        )}
      </div>

      {!isLoadingDetail && detail?.status === 0 && (
        <div className="p-admin-lg bg-admin-surface-container-low border-t border-admin-outline-variant">
          {!isRejecting ? (
            <div className="flex space-x-admin-md">
              <button
                type="button"
                onClick={() => {
                  setIsRejecting(true);
                  setActionError(null);
                }}
                disabled={isSubmittingAction}
                className="flex-1 px-4 py-2 border border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-colors active:scale-95 text-[13px] uppercase tracking-wider font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Từ chối
              </button>
              <button
                type="button"
                onClick={onApprove}
                disabled={isSubmittingAction}
                className="flex-[2] px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-opacity active:scale-95 text-[13px] uppercase tracking-wider font-sans shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingAction ? 'Đang duyệt...' : 'Duyệt hồ sơ'}
              </button>
            </div>
          ) : (
            <div className="flex space-x-admin-md">
              <button
                type="button"
                onClick={() => {
                  setIsRejecting(false);
                  setRejectionReason('');
                  setActionError(null);
                }}
                disabled={isSubmittingAction}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors text-[13px] uppercase tracking-wider font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onRejectConfirm}
                disabled={isSubmittingAction}
                className="flex-[2] px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-opacity text-[13px] uppercase tracking-wider font-sans shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingAction ? 'Đang gửi...' : 'Xác nhận từ chối'}
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
