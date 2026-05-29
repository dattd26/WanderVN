import { useCallback, useEffect, useState } from 'react';
import { userService } from '../../../services';
import type { UserDto, PagedResult } from '../../../types';
import { PartnerModal } from './PartnerModal';
import { PartnerStatsCards } from './components/PartnerStatsCards';
import { PartnerTabs, type PartnerTabKey } from './components/PartnerTabs';
import { PartnerPendingTab } from './components/PartnerPendingTab';
import { PartnerListTable } from './components/PartnerListTable';
import { PartnerPagination } from './components/PartnerPagination';
import { PartnerTableFilters } from './components/PartnerTableFilters';
import { PartnerHotelReviewTab } from './components/PartnerHotelReviewTab';
import { PartnerRejectModal } from './components/PartnerRejectModal';

export function AdminPartners() {
  const [activeTab, setActiveTab] = useState<PartnerTabKey>('list');

  // --- Dữ liệu Partner List (Status = 1) ---
  const [pagedResult, setPagedResult] = useState<PagedResult<UserDto> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Dữ liệu Pending Applications (Status = 0) ---
  const [pendingResult, setPendingResult] = useState<PagedResult<UserDto> | null>(null);

  // --- Pending applications (Mapped from pendingResult) ---
  const applications = (pendingResult?.items ?? [])
    .map((p) => ({
      id: p.id.toString(),
      name: p.fullName || p.email,
      type: 'Stay' as const,
      time: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '',
      status: 'Pending' as const,
      icon: 'apartment',
    }));

  // --- State tìm kiếm & phân trang ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(undefined);

  // --- Modal Thông tin đối tác ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<UserDto | null>(null);

  // --- Modal Từ chối đối tác ---
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  // --- Thống kê tổng quan ---
  const [totalActiveCount, setTotalActiveCount] = useState(0);
  const [totalInactiveCount, setTotalInactiveCount] = useState(0);

  // Debounce search 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load partners
  const fetchPartners = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.getPartners({
        fullName: debouncedSearch || undefined,
        isActive: filterStatus,
        pageNumber,
        pageSize,
        roleName: 'Partner',
        status: 1, // Chỉ lấy đối tác đã duyệt cho danh sách chính
      });
      setPagedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải danh sách đối tác.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filterStatus, pageNumber, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPartners]);

  // Load pending partners (Status = 0)
  const fetchPending = useCallback(async () => {
    try {
      const result = await userService.getPartners({
        status: 0,
        pageNumber: 1,
        pageSize: 100, // Load nhiều để tránh thiếu ở danh sách chờ duyệt
        roleName: 'Partner',
      });
      setPendingResult(result);
    } catch (err) {
      console.error('Lỗi khi tải danh sách chờ duyệt:', err);
    }
  }, []);

  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPending();
  }, [fetchPending]);

  // Load stats (Active / Inactive counts globally)
  const fetchStats = useCallback(async () => {
    try {
      const [activeRes, inactiveRes] = await Promise.all([
        userService.getPartners({ roleName: 'Partner', status: 1, isActive: true, pageNumber: 1, pageSize: 1 }),
        userService.getPartners({ roleName: 'Partner', status: 1, isActive: false, pageNumber: 1, pageSize: 1 }),
      ]);
      setTotalActiveCount(activeRes.totalItems);
      setTotalInactiveCount(inactiveRes.totalItems);
    } catch (err) {
      console.error('Lỗi khi tải thống kê:', err);
    }
  }, []);

  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  const handleTogglePartner = async (id: number, currentStatus: boolean) => {
    try {
      await userService.toggleActive(id, !currentStatus);
      setPagedResult((prev: PagedResult<UserDto> | null) =>
        prev
          ? {
            ...prev,
            items: prev.items.map((p: UserDto) =>
              p.id === id ? { ...p, isActive: !p.isActive } : p
            ),
          }
          : prev
      );
      fetchStats();
    } catch {
      alert('Cập nhật trạng thái khóa/mở khóa thất bại!');
    }
  };

  const handleApprovePartner = async (id: number) => {
    try {
      await userService.approvePartner(id);
      fetchPending();
      fetchPartners();
      fetchStats();
    } catch {
      alert('Duyệt hồ sơ thất bại!');
    }
  };

  const handleRejectPartner = async (id: number, reason: string) => {
    try {
      await userService.rejectPartner(id, reason);
      fetchPending();
      setRejectModalOpen(false);
      setRejectTargetId(null);
    } catch {
      alert('Từ chối hồ sơ thất bại!');
    }
  };

  const handleViewPartner = (partner: UserDto) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value === '' ? undefined : value === 'true');
    setPageNumber(1);
  };

  // --- Derived state ---
  const partners = pagedResult?.items ?? [];
  const totalItems = pagedResult?.totalItems ?? 0;
  const totalPages = pagedResult?.totalPages ?? 0;
  const currentPage = pagedResult?.pageNumber ?? 1;
  const pendingCount = pendingResult?.totalItems ?? 0;

  // listPartners hiện tại đã là status = 1 nhờ API filter
  const listPartners = partners;

  return (
    <div className="p-admin-xl space-y-admin-lg max-w-admin-container-max mx-auto w-full">
      <PartnerStatsCards
        totalPartners={totalActiveCount + totalInactiveCount + pendingCount}
        pendingCount={pendingCount}
        activeCount={totalActiveCount}
        inactiveCount={totalInactiveCount}
      />

      <div className="bg-white rounded-lg border border-admin-outline-variant shadow-sm overflow-hidden">
        <PartnerTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'pending' && (
          <PartnerPendingTab
            applications={applications}
            onApprove={(id) => handleApprovePartner(Number(id))}
            onReject={(id) => {
              setRejectTargetId(Number(id));
              setRejectModalOpen(true);
            }}
          />
        )}

        {activeTab === 'hotel-review' && <PartnerHotelReviewTab />}

        {activeTab === 'list' && (
          <>
            <PartnerTableFilters
              searchTerm={searchTerm}
              pageSize={pageSize}
              filterStatus={filterStatus}
              totalShowing={partners.length}
              totalItems={totalItems}
              onSearchChange={setSearchTerm}
              onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
              onStatusChange={handleStatusChange}
            />
            <PartnerListTable
              partners={listPartners}
              isLoading={isLoading}
              error={error}
              pageSize={pageSize}
              onRetry={fetchPartners}
              onTogglePartner={handleTogglePartner}
              onViewPartner={handleViewPartner}
            />
            {!isLoading && !error && totalPages > 0 && (
              <PartnerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setPageNumber}
              />
            )}
          </>
        )}
      </div>

      <PartnerModal
        isOpen={isModalOpen}
        partner={selectedPartner}
        onClose={handleCloseModal}
      />

      <PartnerRejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectTargetId(null);
        }}
        onSubmit={(reason) => {
          if (rejectTargetId !== null) {
            handleRejectPartner(rejectTargetId, reason);
          }
        }}
      />
    </div>
  );
}
