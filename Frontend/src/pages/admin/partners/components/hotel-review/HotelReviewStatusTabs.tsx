import type { HotelReviewStatus, HotelReviewCounts } from '../../../../../types';

const STATUS_TABS: Array<{ key: HotelReviewStatus; label: string }> = [
  { key: 0, label: 'Chờ duyệt' },
  { key: 1, label: 'Đã duyệt' },
  { key: 2, label: 'Bị từ chối' },
];

const COUNTS_KEY: Record<HotelReviewStatus, keyof HotelReviewCounts> = {
  0: 'pending',
  1: 'approved',
  2: 'rejected',
};

interface HotelReviewStatusTabsProps {
  activeStatus: HotelReviewStatus;
  counts: HotelReviewCounts;
  onStatusChange: (status: HotelReviewStatus) => void;
}

export function HotelReviewStatusTabs({
  activeStatus,
  counts,
  onStatusChange,
}: HotelReviewStatusTabsProps) {
  return (
    <div className="flex space-x-admin-xl border-b border-admin-outline-variant">
      {STATUS_TABS.map((tab) => {
        const isActive = activeStatus === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusChange(tab.key)}
            className={`pb-admin-md text-admin-label-caps font-admin-sans transition-colors ${
              isActive
                ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
                : 'text-admin-on-surface-variant hover:text-admin-primary'
            }`}
          >
            {tab.label} ({counts[COUNTS_KEY[tab.key]]})
          </button>
        );
      })}
    </div>
  );
}
