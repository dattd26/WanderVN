interface UserPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export function UserPagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
}: UserPaginationProps) {
    return (
        <div className="px-admin-xl py-admin-md bg-admin-surface-bright border-t border-admin-outline-variant flex items-center justify-between select-none">
            <span className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                Trang{' '}
                <span className="font-bold text-admin-primary">{currentPage}</span> /{' '}
                <span className="font-bold">{totalPages}</span>
                {' '}&middot;{' '}
                {totalItems.toLocaleString('vi-VN')} kết quả
            </span>
            <div className="flex items-center gap-admin-sm">
                <button
                    className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(1)}
                >
                    <span className="material-symbols-outlined">first_page</span>
                </button>
                <button
                    className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button
                    className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(totalPages)}
                >
                    <span className="material-symbols-outlined">last_page</span>
                </button>
            </div>
        </div>
    );
}