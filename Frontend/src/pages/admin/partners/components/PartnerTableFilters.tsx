interface PartnerTableFiltersProps {
    searchTerm: string;
    pageSize: number;
    filterStatus: boolean | undefined;
    totalShowing: number;
    totalItems: number;
    onSearchChange: (value: string) => void;
    onPageSizeChange: (size: number) => void;
    onStatusChange: (value: string) => void;
}

export function PartnerTableFilters({
    searchTerm,
    pageSize,
    filterStatus,
    totalShowing,
    totalItems,
    onSearchChange,
    onPageSizeChange,
    onStatusChange,
}: PartnerTableFiltersProps) {
    return (
        <div className="p-admin-md bg-admin-surface-bright border-b border-admin-outline-variant flex flex-wrap items-center justify-between gap-admin-md">
            <div className="flex items-center gap-admin-md flex-grow">
                {/* Ô tìm kiếm */}
                <div className="relative max-w-md w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-admin-md py-admin-sm bg-white border border-admin-outline-variant rounded-lg text-admin-body-sm focus:ring-1 focus:ring-admin-secondary focus:outline-none text-admin-on-surface"
                    />
                </div>

                {/* Số dòng mỗi trang */}
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="bg-white border border-admin-outline-variant rounded-lg text-admin-body-sm py-admin-sm px-admin-md focus:outline-none text-admin-on-surface"
                >
                    <option value={10}>10 / trang</option>
                    <option value={15}>15 / trang</option>
                    <option value={30}>30 / trang</option>
                    <option value={50}>50 / trang</option>
                </select>

                {/* Lọc trạng thái */}
                <select
                    value={filterStatus === undefined ? '' : filterStatus.toString()}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="bg-white border border-admin-outline-variant rounded-lg text-admin-body-sm py-admin-sm px-admin-md focus:outline-none text-admin-on-surface"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                Hiển thị{' '}
                <span className="font-bold text-admin-primary">{totalShowing}</span> /{' '}
                <span className="font-bold text-admin-primary">{totalItems.toLocaleString('vi-VN')}</span>{' '}
                đối tác
            </p>
        </div>
    );
}
