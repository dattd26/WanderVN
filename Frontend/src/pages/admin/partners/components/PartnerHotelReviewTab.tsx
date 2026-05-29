import { useState, useEffect, useCallback } from 'react';
import { adminHotelReviewService } from '../../../../services';
import type {
  AdminHotelListItemDto,
  AdminHotelDetailDto,
  HotelReviewStatus,
  HotelReviewCounts,
} from '../../../../types';

import { HotelReviewStatusTabs } from './hotel-review/HotelReviewStatusTabs';
import { HotelReviewTable } from './hotel-review/HotelReviewTable';
import { HotelReviewDetailSidebar } from './hotel-review/HotelReviewDetailSidebar';

export function PartnerHotelReviewTab() {
  const [activeStatus, setActiveStatus] = useState<HotelReviewStatus>(0);
  const [hotels, setHotels] = useState<AdminHotelListItemDto[]>([]);
  const [counts, setCounts] = useState<HotelReviewCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminHotelDetailDto | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      const data = await adminHotelReviewService.getCounts();
      setCounts(data);
    } catch (err) {
      console.error('Lỗi khi tải số lượng hồ sơ:', err);
    }
  }, []);

  const fetchList = useCallback(
    async (autoSelect: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await adminHotelReviewService.getHotelsForReview({
          status: activeStatus,
          pageNumber,
          pageSize,
        });
        setHotels(result.items);
        setTotalItems(result.totalCount);
        setTotalPages(result.totalPages);

        if (autoSelect) {
          if (result.items.length > 0) {
            setSelectedId((prev) =>
              prev && result.items.some((h) => h.id === prev) ? prev : result.items[0].id,
            );
          } else {
            setSelectedId(null);
            setDetail(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
        setHotels([]);
        setSelectedId(null);
        setDetail(null);
      } finally {
        setIsLoading(false);
      }
    },
    [activeStatus, pageNumber, pageSize],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchList(true);
  }, [fetchList]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    if (selectedId === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetail(null);
      return;
    }
    let cancelled = false;
    setIsLoadingDetail(true);
    setIsRejecting(false);
    setRejectionReason('');
    setActionError(null);
    adminHotelReviewService
      .getHotelDetail(selectedId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Lỗi khi tải chi tiết hồ sơ:', err);
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleStatusChange = (s: HotelReviewStatus) => {
    setActiveStatus(s);
    setPageNumber(1);
    setSelectedId(null);
    setDetail(null);
  };

  const handleSelectHotel = (id: number) => {
    setSelectedId(id);
  };

  const handleApprove = async () => {
    if (!selectedId || !detail) return;
    if (!window.confirm(`Bạn có chắc chắn muốn duyệt hồ sơ của khách sạn "${detail.name}"?`)) return;
    setIsSubmittingAction(true);
    setActionError(null);
    try {
      await adminHotelReviewService.approveHotel(selectedId);
      await Promise.all([fetchList(false), fetchCounts()]);
      setSelectedId(null);
      setDetail(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Duyệt hồ sơ thất bại.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedId || !detail) return;
    if (!rejectionReason.trim()) {
      setActionError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setIsSubmittingAction(true);
    setActionError(null);
    try {
      await adminHotelReviewService.rejectHotel(selectedId, rejectionReason.trim());
      await Promise.all([fetchList(false), fetchCounts()]);
      setIsRejecting(false);
      setRejectionReason('');
      setSelectedId(null);
      setDetail(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Từ chối hồ sơ thất bại.');
    } finally {
      setIsSubmittingAction(false);
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

        <HotelReviewStatusTabs
          activeStatus={activeStatus}
          counts={counts}
          onStatusChange={handleStatusChange}
        />

        <HotelReviewTable
          hotels={hotels}
          isLoading={isLoading}
          error={error}
          selectedId={selectedId}
          onSelectHotel={handleSelectHotel}
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalItems={totalItems}
          setPageNumber={setPageNumber}
          onRetry={() => fetchList(true)}
        />
      </div>

      {selectedId !== null && detail && (
        <HotelReviewDetailSidebar
          detail={detail}
          isLoadingDetail={isLoadingDetail}
          onClose={() => {
            setSelectedId(null);
            setDetail(null);
          }}
          onApprove={handleApprove}
          onRejectConfirm={handleConfirmReject}
          isSubmittingAction={isSubmittingAction}
          isRejecting={isRejecting}
          setIsRejecting={setIsRejecting}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          actionError={actionError}
          setActionError={setActionError}
        />
      )}
    </div>
  );
}
