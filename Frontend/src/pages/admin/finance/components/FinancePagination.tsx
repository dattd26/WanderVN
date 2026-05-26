interface Props {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export function FinancePagination({ currentPage, totalPages, totalItems, onPageChange }: Props) {
    if (totalPages <= 0) return null;

    const canPrev = currentPage > 1;
    const canNext = currentPage < totalPages;

    const buildPages = () => {
        const pages: (number | 'ellipsis')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }
        pages.push(1);
        if (currentPage > 4) pages.push('ellipsis');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 3) pages.push('ellipsis');
        pages.push(totalPages);
        return pages;
    };

    return (
        <div className="px-admin-lg py-admin-md border-t border-admin-outline-variant flex items-center justify-between bg-white select-none">
            <p className="text-admin-body-sm text-admin-outline font-admin-sans">
                Trang {currentPage} / {totalPages} — Tổng {totalItems} khoản
            </p>
            <div className="flex items-center gap-admin-xs font-admin-sans">
                <button
                    onClick={() => canPrev && onPageChange(1)}
                    disabled={!canPrev}
                    className={`p-1 rounded transition-colors ${canPrev ? 'hover:bg-admin-surface-container text-admin-primary' : 'opacity-40 cursor-not-allowed'}`}
                    title="Trang đầu"
                >
                    <span className="material-symbols-outlined">first_page</span>
                </button>
                <button
                    onClick={() => canPrev && onPageChange(currentPage - 1)}
                    disabled={!canPrev}
                    className={`p-1 rounded transition-colors ${canPrev ? 'hover:bg-admin-surface-container text-admin-primary' : 'opacity-40 cursor-not-allowed'}`}
                    title="Trang trước"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {buildPages().map((p, idx) =>
                    p === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-2 text-admin-outline font-bold">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                                p === currentPage
                                    ? 'bg-admin-primary text-white'
                                    : 'hover:bg-admin-surface-container text-admin-primary'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => canNext && onPageChange(currentPage + 1)}
                    disabled={!canNext}
                    className={`p-1 rounded transition-colors ${canNext ? 'hover:bg-admin-surface-container text-admin-primary' : 'opacity-40 cursor-not-allowed'}`}
                    title="Trang sau"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button
                    onClick={() => canNext && onPageChange(totalPages)}
                    disabled={!canNext}
                    className={`p-1 rounded transition-colors ${canNext ? 'hover:bg-admin-surface-container text-admin-primary' : 'opacity-40 cursor-not-allowed'}`}
                    title="Trang cuối"
                >
                    <span className="material-symbols-outlined">last_page</span>
                </button>
            </div>
        </div>
    );
}
