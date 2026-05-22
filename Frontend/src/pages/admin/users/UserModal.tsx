import { useState, useEffect } from 'react';
import { userService } from '../../../services';
import type { UserDetailsDto } from '../../../types';

interface UserModalProps {
  isOpen: boolean;
  userId: number | null;
  onClose: () => void;
}

export function UserModal({ isOpen, userId, onClose }: UserModalProps) {
  const [user, setUser] = useState<UserDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      setError(null);
      setUser(null);
      userService
        .getCustomerById(userId)
        .then((data) => setUser(data))
        .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải thông tin người dùng'))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-admin-xl py-admin-md border-b border-admin-outline-variant flex items-center justify-between bg-admin-surface-bright select-none shrink-0">
          <h3 className="font-admin-sans text-admin-headline-md text-admin-primary">
            Chi Tiết Người Dùng
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-admin-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-admin-xl overflow-y-auto custom-scrollbar flex-grow">
          {isLoading ? (
            /* Loading state */
            <div className="space-y-admin-lg animate-pulse">
              <div className="flex flex-col items-center gap-admin-sm pb-admin-md border-b border-admin-outline-variant/30">
                <div className="w-24 h-24 rounded-full bg-admin-surface-container-low" />
                <div className="h-5 w-40 bg-admin-surface-container-low rounded" />
                <div className="h-4 w-32 bg-admin-surface-container-low rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-admin-lg">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 bg-admin-surface-container-low rounded" />
                    <div className="h-5 w-full bg-admin-surface-container-low rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            /* Error state */
            <div className="flex flex-col items-center gap-admin-md py-admin-xl">
              <span className="material-symbols-outlined text-error text-[48px]">error</span>
              <p className="text-error font-admin-sans font-bold text-admin-body-md">{error}</p>
              <button
                onClick={() => {
                  if (userId) {
                    setIsLoading(true);
                    setError(null);
                    userService
                      .getCustomerById(userId)
                      .then((data) => setUser(data))
                      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi'))
                      .finally(() => setIsLoading(false));
                  }
                }}
                className="px-admin-lg py-admin-sm bg-admin-primary-container text-admin-on-primary font-bold rounded-lg hover:bg-admin-primary transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : user ? (
            /* User detail content */
            <div className="space-y-admin-lg">
              {/* Avatar & Name Header */}
              <div className="flex flex-col items-center gap-admin-sm pb-admin-md border-b border-admin-outline-variant/30 select-none">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || ''}
                    className="w-24 h-24 rounded-full border-2 border-admin-outline-variant object-cover shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-admin-primary-container flex items-center justify-center text-admin-on-primary font-bold text-2xl shadow-md">
                    {getInitials(user.fullName)}
                  </div>
                )}
                <h4 className="font-admin-sans text-admin-headline-sm text-admin-primary font-bold">
                  {user.fullName || '(Chưa có tên)'}
                </h4>
                <div className="flex items-center gap-admin-sm">
                  {user.isActive !== false ? (
                    <span className="inline-flex items-center gap-admin-xs px-admin-sm py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold border border-green-200 uppercase tracking-wider font-admin-sans">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-admin-xs px-admin-sm py-0.5 rounded-full bg-error-container text-error text-[11px] font-bold border border-error/20 uppercase tracking-wider font-admin-sans">
                      <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
                      Locked
                    </span>
                  )}
                  {user.roleName && (
                    <span className="inline-flex items-center px-admin-sm py-0.5 rounded-full bg-admin-surface-container-low text-admin-on-surface-variant text-[11px] font-bold border border-admin-outline-variant uppercase tracking-wider font-admin-sans">
                      {user.roleName}
                    </span>
                  )}
                </div>
              </div>

              {/* Detail Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-admin-lg">
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">ID</label>
                  <p className="px-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-lg text-admin-body-md text-admin-on-surface font-admin-mono">
                    #{user.id}
                  </p>
                </div>
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">HỌ VÀ TÊN</label>
                  <p className="px-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-lg text-admin-body-md text-admin-on-surface">
                    {user.fullName || '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">EMAIL</label>
                  <p className="px-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-lg text-admin-body-md text-admin-on-surface break-all">
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">SỐ ĐIỆN THOẠI</label>
                  <p className="px-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-lg text-admin-body-md text-admin-on-surface">
                    {user.phoneNumber || '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">VAI TRÒ</label>
                  <p className="px-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-lg text-admin-body-md text-admin-on-surface">
                    {user.roleName || '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">NGÀY TẠO</label>
                  <p className="px-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-lg text-admin-body-md text-admin-on-surface">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Hotels section (if any) */}
              {user.hotels && user.hotels.length > 0 && (
                <div className="pt-admin-md border-t border-admin-outline-variant/30">
                  <h5 className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold mb-admin-md uppercase">
                    Khách sạn liên kết ({user.hotels.length})
                  </h5>
                  <div className="space-y-admin-sm">
                    {user.hotels.map((hotel) => (
                      <div
                        key={hotel.id}
                        className="flex items-center justify-between p-admin-md bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-lg"
                      >
                        <div className="flex items-center gap-admin-md">
                          <span className="material-symbols-outlined text-admin-primary text-[20px]">hotel</span>
                          <div>
                            <p className="font-admin-sans text-admin-body-md font-bold text-admin-on-surface">
                              {hotel.name}
                            </p>
                            {hotel.address && (
                              <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                                {hotel.address}
                              </p>
                            )}
                          </div>
                        </div>
                        {hotel.starRating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: hotel.starRating }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-[16px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                star
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-admin-xl py-admin-lg border-t border-admin-outline-variant bg-admin-surface-container-low flex justify-end gap-admin-md select-none shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-admin-lg py-admin-sm border border-admin-outline-variant text-admin-on-surface-variant font-bold rounded-lg hover:bg-admin-surface-container transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
