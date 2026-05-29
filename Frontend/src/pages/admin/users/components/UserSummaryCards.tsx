import React from 'react';

interface UserSummaryCardsProps {
    totalItems: number;
    totalActive: number;
    totalLocked: number;
    totalPages: number;
}

export const UserSummaryCards = React.memo(function UserSummaryCards({
    totalItems,
    totalActive,
    totalLocked,
    totalPages,
}: UserSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-admin-lg select-none">
            <div className="bg-white border-l-4 border-[#002B5B] p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
                <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
                    TỔNG NGƯỜI DÙNG
                </p>
                <div className="flex items-end gap-admin-sm">
                    <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
                        {totalItems.toLocaleString('vi-VN')}
                    </h4>
                </div>
            </div>
            <div className="bg-white border-l-4 border-[#10B981] p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
                <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
                    ACTIVE (ĐANG HOẠT ĐỘNG)
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
                    LOCKED (ĐÃ KHOÁ)
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
                    <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
                        {totalPages}
                    </h4>
                </div>
            </div>
        </div>
    );
});