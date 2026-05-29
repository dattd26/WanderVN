import { useState, useEffect, useCallback } from 'react';
import { userService } from '../../../services';
import type { UserDto, PagedResult } from '../../../types';
import { UserModal } from './UserModal';
import { UserSummaryCards } from './components/UserSummaryCards';
import { UserTableFilters } from './components/UserTableFilters';
import { UserTableBody } from './components/UserTableBody';
import { UserPagination } from './components/UserPagination';
import { GovernanceCard } from './components/GovernanceCard';

export function AdminUsers() {
  // --- State dữ liệu API ---
  const [pagedResult, setPagedResult] = useState<PagedResult<UserDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State tìm kiếm & phân trang ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ✅ State lọc trạng thái
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(undefined);

  // --- Thống kê tổng quan ---
  const [totalActiveCount, setTotalActiveCount] = useState(0);
  const [totalLockedCount, setTotalLockedCount] = useState(0);

  // --- State modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Debounce search 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Gọi API
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.getCustomers({
        fullName: debouncedSearch || undefined,
        pageNumber,
        pageSize,
        isActive: filterStatus, // ✅ truyền isActive
      });
      setPagedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, pageNumber, pageSize, filterStatus]); // ✅ deps đủ

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const fetchStats = useCallback(async (ignore?: () => boolean) => {
    try {
      const [activeRes, lockedRes] = await Promise.all([
        userService.getCustomers({ isActive: true, pageNumber: 1, pageSize: 1 }),
        userService.getCustomers({ isActive: false, pageNumber: 1, pageSize: 1 }),
      ]);

      if (ignore?.()) return;

      setTotalActiveCount(activeRes.totalItems);
      setTotalLockedCount(lockedRes.totalItems);
    } catch (err) {
      if (!ignore?.()) {
        console.error('Lỗi tải thống kê:', err);
      }
    }
  }, []);


  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, [fetchStats]);

  // --- Handlers ---
  const handleCreateUser = () => {
    setSelectedUserId(null);
    setIsModalOpen(true);
  };

  const handleViewUser = (userId: number) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  // ✅ Handler đổi trạng thái filter
  const handleStatusChange = (value: string) => {
    setFilterStatus(value === '' ? undefined : value === 'true');
    setPageNumber(1);
  };

  const handleToggleLockUser = async (userId: number, currentActive: boolean) => {
    const actionText = currentActive ? 'khoá' : 'mở khoá';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này không?`)) return;
    try {
      await userService.updateCustomer(userId, { isActive: !currentActive });
      fetchCustomers();
      fetchStats();
    } catch (err) {
      const error = err as Error;
      console.error('Lỗi khi thay đổi trạng thái:', error);
      alert(error.message || `Có lỗi xảy ra khi ${actionText} người dùng.`);
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá người dùng [${email}] không? Thao tác này không thể hoàn tác.`)) return;
    try {
      await userService.deleteCustomer(userId);
      alert('Xóa khách hàng thành công!');
      fetchCustomers();
      fetchStats();
    } catch (err) {
      const error = err as Error;
      console.error('Lỗi khi xóa người dùng:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa người dùng này.');
    }
  };

  // --- Derived state ---
  const users = pagedResult?.items ?? [];
  const totalItems = pagedResult?.totalItems ?? 0;
  const totalPages = pagedResult?.totalPages ?? 0;
  const currentPage = pagedResult?.pageNumber ?? 1;

  return (
    <div className="p-admin-xl space-y-admin-xl max-w-admin-container-max mx-auto w-full">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-admin-lg">
        <div>
          <h3 className="font-admin-sans text-admin-display-lg text-admin-primary mb-admin-xs">
            Quản lý Khách hàng
          </h3>
          <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-md">
            Quản lý và theo dõi các tài khoản khách hàng trên toàn hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-admin-md select-none">
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-admin-sm px-admin-md py-admin-sm bg-admin-primary text-white hover:bg-admin-primary/90 transition-all duration-200 rounded-lg shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span className="font-admin-sans text-admin-body-md font-bold">Thêm khách hàng</span>
          </button>
          <button className="flex items-center gap-admin-sm px-admin-md py-admin-sm bg-admin-surface-container-lowest text-admin-on-surface border border-admin-outline-variant hover:border-admin-primary transition-all duration-200 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            <span className="font-admin-sans text-admin-body-md font-bold">Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Bento Cards — React.memo, không re-render khi gõ search */}
      <UserSummaryCards
        totalItems={totalItems}
        totalActive={totalActiveCount}
        totalLocked={totalLockedCount}
        totalPages={totalPages}
      />

      {/* Table Container */}
      <div className="bg-white border border-admin-outline-variant rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
        <UserTableFilters
          searchTerm={searchTerm}
          pageSize={pageSize}
          filterStatus={filterStatus}
          totalShowing={users.length}
          totalItems={totalItems}
          onSearchChange={setSearchTerm}
          onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
          onStatusChange={handleStatusChange}
        />
        <UserTableBody
          users={users}
          isLoading={isLoading}
          error={error}
          pageSize={pageSize}
          currentPage={currentPage}
          onRetry={fetchCustomers}
          onViewUser={handleViewUser}
          onToggleLock={handleToggleLockUser}
          onDeleteUser={handleDeleteUser}
        />
        {!isLoading && !error && totalPages > 0 && (
          <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPageNumber}
          />
        )}
      </div>

      {/* Governance Card — React.memo, không bao giờ re-render */}
      <GovernanceCard />

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        userId={selectedUserId}
        onClose={() => { setIsModalOpen(false); setSelectedUserId(null); }}
        onSaveSuccess={() => {
          fetchCustomers();
          fetchStats();
        }}
      />
    </div>
  );
}