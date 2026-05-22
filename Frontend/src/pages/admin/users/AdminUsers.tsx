import { useState, useEffect, useCallback } from 'react';
import { userService } from '../../../services';
import type { UserDto, PagedResult } from '../../../types';
import { UserModal } from './UserModal';

export function AdminUsers() {
  // --- State quản lý dữ liệu API ---
  const [pagedResult, setPagedResult] = useState<PagedResult<UserDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State tìm kiếm & phân trang ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- State modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Debounce search: chờ 400ms sau khi user ngừng gõ mới gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNumber(1); // reset về trang 1 khi tìm kiếm mới
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Gọi API lấy danh sách customers
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.getCustomers({
        fullName: debouncedSearch || undefined,
        pageNumber,
        pageSize,
      });
      setPagedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, pageNumber, pageSize]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // --- Helpers ---
  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
  };

  // --- Hardcoded UI Handlers (Xử lý giả lập hoàn toàn trên Frontend) ---

  // Mở modal tạo mới người dùng
  const handleCreateUser = () => {
    setSelectedUserId(null);
    setIsModalOpen(true);
  };

  // Xem chi tiết người dùng
  const handleViewUser = (userId: number) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  // Giả lập chức năng Khoá / Mở khoá trực tiếp trên UI State
  const handleToggleLockUserHardcoded = (userId: number, currentActive: boolean) => {
    const actionText = currentActive ? 'khoá' : 'mở khoá';
    if (!window.confirm(`[DEMO] Bạn có chắc chắn muốn ${actionText} người dùng này không?`)) return;

    setPagedResult(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map(user =>
          user.id === userId ? { ...user, isActive: !currentActive } : user
        )
      };
    });
  };

  // Giả lập chức năng Xoá người dùng trực tiếp trên UI State
  const handleDeleteUserHardcoded = (userId: number) => {
    if (!window.confirm('[DEMO] Bạn có chắc chắn muốn xoá người dùng này? Thao tác này sẽ biến mất trên giao diện hiện tại.')) return;

    setPagedResult(prev => {
      if (!prev) return null;
      const updatedItems = prev.items.filter(user => user.id !== userId);
      return {
        ...prev,
        items: updatedItems,
        totalItems: prev.totalItems - 1 // Giảm tổng số lượng user đi 1
      };
    });
  };

  // --- Phân trang & Thống kê ---
  const users = pagedResult?.items ?? [];
  const totalItems = pagedResult?.totalItems ?? 0;
  const totalPages = pagedResult?.totalPages ?? 0;
  const currentPage = pagedResult?.pageNumber ?? 1;

  // Bento grid tự động tính toán lại khi bạn ấn nút Khoá/Mở khoá giả lập ở trên
  const totalActive = users.filter(u => u.isActive === true).length;
  const totalLocked = users.filter(u => u.isActive === false).length;

  return (
    <div className="p-admin-xl space-y-admin-xl max-w-admin-container-max mx-auto w-full">
      {/* Page Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-admin-lg">
        <div>
          <h3 className="font-admin-sans text-admin-display-lg text-admin-primary mb-admin-xs">
            Customer Directory
          </h3>
          <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-md">
            Manage and monitor verified traveler accounts across the platform.
          </p>
        </div>
        <div className="flex items-center gap-admin-md select-none">
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-admin-sm px-admin-md py-admin-sm bg-admin-primary text-white hover:bg-admin-primary/90 transition-all duration-200 rounded-lg shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span className="font-admin-sans text-admin-body-md font-bold">Create User</span>
          </button>

          <button className="flex items-center gap-admin-sm px-admin-md py-admin-sm bg-admin-surface-container-lowest text-admin-on-surface border border-admin-outline-variant hover:border-admin-primary transition-all duration-200 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            <span className="font-admin-sans text-admin-body-md font-bold">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bento Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-admin-lg select-none">
        <div className="bg-white border-l-4 border-[#002B5B] p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
            TOTAL USERS
          </p>
          <div className="flex items-end gap-admin-sm">
            <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">{totalItems.toLocaleString('vi-VN')}</h4>
          </div>
        </div>
        <div className="bg-white border-l-4 border-[#10B981] p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
            ACTIVE (TRANG NÀY)
          </p>
          <div className="flex items-end gap-admin-sm">
            <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {totalActive}
            </h4>
            <span className="text-[#10B981] text-[12px] font-bold mb-1">Live</span>
          </div>
        </div>
        <div className="bg-white border-l-4 border-[#F59E0B] p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
            LOCKED (TRANG NÀY)
          </p>
          <div className="flex items-end gap-admin-sm">
            <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {totalLocked}
            </h4>
          </div>
        </div>
        <div className="bg-white border-l-4 border-admin-primary p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
            TỔNG SỐ TRANG
          </p>
          <div className="flex items-end gap-admin-sm">
            <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">{totalPages}</h4>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-admin-outline-variant rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
        {/* Table Filters */}
        <div className="p-admin-md bg-admin-surface-bright border-b border-admin-outline-variant flex flex-wrap items-center justify-between gap-admin-md">
          <div className="flex items-center gap-admin-md flex-grow">
            <div className="relative max-w-md w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-admin-md py-admin-sm bg-white border border-admin-outline-variant rounded-lg text-admin-body-sm focus:ring-1 focus:ring-admin-secondary focus:outline-none text-admin-on-surface"
              />
            </div>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
              className="bg-white border border-admin-outline-variant rounded-lg text-admin-body-sm py-admin-sm px-admin-md focus:outline-none text-admin-on-surface"
            >
              <option value={10}>10 / trang</option>
              <option value={15}>15 / trang</option>
              <option value={30}>30 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
          <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
            Hiển thị <span className="font-bold text-admin-primary">{users.length}</span> / <span className="font-bold text-admin-primary">{totalItems.toLocaleString('vi-VN')}</span> người dùng
          </p>
        </div>

        {/* Main Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-admin-surface-container-low border-b border-admin-outline-variant select-none">
                {/* Đổi tiêu đề từ ID thành STT */}
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">STT</th>
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">Người dùng</th>
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">Liên hệ</th>
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">Trạng thái</th>
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-outline-variant/30">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-admin-lg py-admin-md"><div className="h-4 w-16 bg-admin-surface-container-low rounded" /></td>
                    <td className="px-admin-lg py-admin-md">
                      <div className="flex items-center gap-admin-md">
                        <div className="w-10 h-10 rounded-full bg-admin-surface-container-low" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 bg-admin-surface-container-low rounded" />
                          <div className="h-3 w-20 bg-admin-surface-container-low rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-admin-lg py-admin-md">
                      <div className="space-y-1.5">
                        <div className="h-4 w-40 bg-admin-surface-container-low rounded" />
                        <div className="h-3 w-28 bg-admin-surface-container-low rounded" />
                      </div>
                    </td>
                    <td className="px-admin-lg py-admin-md"><div className="h-5 w-16 bg-admin-surface-container-low rounded-full" /></td>
                    <td className="px-admin-lg py-admin-md"><div className="h-6 w-8 bg-admin-surface-container-low rounded ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-admin-lg py-admin-xl text-center">
                    <div className="flex flex-col items-center gap-admin-md">
                      <span className="material-symbols-outlined text-error text-[40px]">error</span>
                      <p className="text-error font-admin-sans font-bold">{error}</p>
                      <button
                        onClick={fetchCustomers}
                        className="px-admin-lg py-admin-sm bg-admin-primary-container text-admin-on-primary font-bold rounded-lg hover:bg-admin-primary transition-all"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => {
                  {/* Tính toán Số Thứ Tự (STT) dựa theo trang hiện tại */ }
                  const stt = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={user.id} className="hover:bg-admin-surface-container-low transition-colors group">
                      {/* Thay đổi ô ID thành hiển thị biến đếm STT tăng dần */}
                      <td className="px-admin-lg py-admin-md font-admin-mono text-admin-data-mono text-admin-on-surface-variant">
                        {stt}
                      </td>
                      <td className="px-admin-lg py-admin-md">
                        <div className="flex items-center gap-admin-md">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName || ''}
                              className={`w-10 h-10 rounded-full border border-admin-outline-variant object-cover shadow-sm ${user.isActive === false ? 'grayscale opacity-80' : ''}`}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full bg-admin-primary-container flex items-center justify-center text-admin-on-primary font-bold text-sm ${user.isActive === false ? 'opacity-60' : ''}`}>
                              {getInitials(user.fullName)}
                            </div>
                          )}
                          <div>
                            <p className={`font-admin-sans text-admin-body-md font-bold ${user.isActive === false ? 'text-admin-on-surface-variant' : 'text-admin-on-surface'}`}>
                              {user.fullName || '(Chưa có tên)'}
                            </p>
                            <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                              {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-admin-lg py-admin-md">
                        <p className={`font-admin-sans text-admin-body-md ${user.isActive === false ? 'text-admin-on-surface-variant' : 'text-admin-on-surface'}`}>
                          {user.email}
                        </p>
                        <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                          {user.phoneNumber || '—'}
                        </p>
                      </td>
                      <td className="px-admin-lg py-admin-md">
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
                      </td>
                      <td className="px-admin-lg py-admin-md">
                        <div className="flex justify-end gap-admin-sm opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* Nút Xem chi tiết */}
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="p-1 hover:bg-admin-surface-container-high rounded-lg text-admin-primary transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>

                          {/* Nút Khoá / Mở khoá giả lập UI */}
                          <button
                            onClick={() => handleToggleLockUserHardcoded(user.id, user.isActive !== false)}
                            className={`p-1 hover:bg-admin-surface-container-high rounded-lg transition-colors ${user.isActive !== false ? 'text-amber-500 hover:text-amber-700' : 'text-green-600 hover:text-green-800'}`}
                            title={user.isActive !== false ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {user.isActive !== false ? 'lock' : 'lock_open'}
                            </span>
                          </button>

                          {/* Nút Xoá người dùng giả lập UI */}
                          <button
                            onClick={() => handleDeleteUserHardcoded(user.id)}
                            className="p-1 hover:bg-admin-surface-container-high rounded-lg text-red-500 hover:text-red-700 transition-colors"
                            title="Xoá người dùng"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant font-admin-sans">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && !error && totalPages > 0 && (
          <div className="px-admin-xl py-admin-md bg-admin-surface-bright border-t border-admin-outline-variant flex items-center justify-between select-none">
            <div className="flex items-center gap-admin-md">
              <span className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                Trang <span className="font-bold text-admin-primary">{currentPage}</span> / <span className="font-bold">{totalPages}</span>
                {' '}&middot;{' '}{totalItems.toLocaleString('vi-VN')} kết quả
              </span>
            </div>
            <div className="flex items-center gap-admin-sm">
              <button
                className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                disabled={currentPage <= 1}
                onClick={() => setPageNumber(1)}
              >
                <span className="material-symbols-outlined">first_page</span>
              </button>
              <button
                className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                disabled={currentPage <= 1}
                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="flex items-center px-admin-md font-admin-sans">
                <span className="text-admin-body-sm font-bold text-admin-primary">{currentPage}</span>
                <span className="text-admin-body-sm text-admin-on-surface-variant px-admin-md">/</span>
                <span className="text-admin-body-sm text-admin-on-surface-variant">{totalPages}</span>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                disabled={currentPage >= totalPages}
                onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button
                className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                disabled={currentPage >= totalPages}
                onClick={() => setPageNumber(totalPages)}
              >
                <span className="material-symbols-outlined">last_page</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contextual Governance Card */}
      <div className="bg-admin-primary-container p-admin-xl rounded-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-admin-xl">
          <div className="max-w-xl">
            <h4 className="font-admin-sans text-admin-headline-sm text-admin-on-primary mb-admin-sm">
              Automated Governance Active
            </h4>
            <p className="text-admin-on-primary-container text-admin-body-md opacity-90 leading-relaxed font-admin-sans">
              The WanderVN system is currently monitoring user behavior patterns. You can review automated locks in the Security Dashboard.
            </p>
          </div>
          <button className="px-admin-xl py-admin-md bg-white text-admin-primary font-bold rounded-lg shadow-xl hover:bg-admin-surface-bright transition-all whitespace-nowrap font-admin-sans">
            Review Security Alerts
          </button>
        </div>
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* User detail modal */}
      <UserModal
        isOpen={isModalOpen}
        userId={selectedUserId}
        onClose={() => { setIsModalOpen(false); setSelectedUserId(null); }}
      />
    </div>
  );
}