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

export function AdminPartners() {
  const [activeTab, setActiveTab] = useState<PartnerTabKey>('list');

  // --- Dữ liệu Partner List ---
  const [pagedResult, setPagedResult] = useState<PagedResult<UserDto> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Pending applications (Mapped from status === 0) ---
  const applications = (pagedResult?.items ?? [])
    .filter((p) => p.status === 0) // 0 is Pending
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

  // --- Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<UserDto | null>(null);

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
    } catch {
      alert('Cập nhật trạng thái khóa/mở khóa thất bại!');
    }
  };

  const handleApprovePartner = async (id: number) => {
    try {
      await userService.approvePartner(id);
      setPagedResult((prev: PagedResult<UserDto> | null) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((p: UserDto) =>
                p.id === id ? { ...p, status: 1, isActive: true } : p // 1 is Active
              ),
            }
          : prev
      );
    } catch {
      alert('Duyệt hồ sơ thất bại!');
    }
  };

  const handleRejectPartner = async (id: number, reason: string) => {
    try {
      await userService.rejectPartner(id, reason);
      setPagedResult((prev: PagedResult<UserDto> | null) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((p: UserDto) =>
                p.id === id ? { ...p, status: 2, rejectReason: reason } : p // 2 is Rejected
              ),
            }
          : prev
      );
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
  const pendingCount = applications.filter((app) => app.status === 'Pending').length;
  // Filter out pending and rejected from main list view if needed, but currently list shows all
  const listPartners = partners.filter((p: UserDto) => p.status === 1); // Only active status
  
  const activeCount = listPartners.filter((p: UserDto) => p.isActive).length;
  const inactiveCount = listPartners.filter((p: UserDto) => !p.isActive).length;

  return (
    <div className="p-admin-xl space-y-admin-lg max-w-admin-container-max mx-auto w-full">
      <PartnerStatsCards
        totalPartners={totalItems}
        pendingCount={pendingCount}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
      />

      <div className="bg-white rounded-lg border border-admin-outline-variant shadow-sm overflow-hidden">
        <PartnerTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'pending' && (
          <PartnerPendingTab
            applications={applications}
            onApprove={(id) => handleApprovePartner(Number(id))}
            onReject={(id) => {
              const reason = prompt('Nhập lý do từ chối:');
              if (reason) handleRejectPartner(Number(id), reason);
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
    </div>
  );
}
