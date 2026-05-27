import type { PayoutStatus } from '../../../../types';

interface Props {
    keyword: string;
    status: PayoutStatus | '';
    fromDate: string;
    toDate: string;
    pageSize: number;
    onKeywordChange: (v: string) => void;
    onStatusChange: (v: PayoutStatus | '') => void;
    onFromDateChange: (v: string) => void;
    onToDateChange: (v: string) => void;
    onPageSizeChange: (v: number) => void;
    onReset: () => void;
}

export function FinanceFilters({
    keyword,
    status,
    fromDate,
    toDate,
    pageSize,
    onKeywordChange,
    onStatusChange,
    onFromDateChange,
    onToDateChange,
    onPageSizeChange,
    onReset,
}: Props) {
    return (
        <div className="bg-white p-admin-md border border-admin-outline-variant rounded-lg mb-admin-lg select-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-admin-md items-end">
                <div className="lg:col-span-2">
                    <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface mb-admin-xs">
                        Tìm Partner / Booking
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-admin-outline text-[18px]">
                            search
                        </span>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => onKeywordChange(e.target.value)}
                            placeholder="Tên, email partner hoặc mã booking..."
                            className="w-full border border-admin-outline-variant rounded p-2 pl-8 text-admin-body-md focus:ring-admin-secondary focus:border-admin-secondary outline-none text-admin-on-surface transition-all font-admin-sans"
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface mb-admin-xs">
                        Trạng thái
                    </label>
                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value as PayoutStatus | '')}
                        className="w-full border border-admin-outline-variant rounded p-2 text-admin-body-md focus:ring-admin-secondary focus:border-admin-secondary outline-none text-admin-on-surface transition-all font-admin-sans bg-white"
                    >
                        <option value="">Tất cả</option>
                        <option value="Pending">Chờ thanh toán</option>
                        <option value="Approved">Đã duyệt</option>
                        <option value="Paid">Đã chi trả</option>
                        <option value="Rejected">Từ chối</option>
                    </select>
                </div>

                <div>
                    <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface mb-admin-xs">
                        Từ ngày
                    </label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => onFromDateChange(e.target.value)}
                        className="w-full border border-admin-outline-variant rounded p-2 text-admin-body-md focus:ring-admin-secondary focus:border-admin-secondary outline-none text-admin-on-surface transition-all font-admin-sans"
                    />
                </div>

                <div>
                    <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface mb-admin-xs">
                        Đến ngày
                    </label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => onToDateChange(e.target.value)}
                        className="w-full border border-admin-outline-variant rounded p-2 text-admin-body-md focus:ring-admin-secondary focus:border-admin-secondary outline-none text-admin-on-surface transition-all font-admin-sans"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-admin-md mt-admin-md">
                <div className="flex items-center gap-admin-sm font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
                    <span>Hiển thị</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="border border-admin-outline-variant rounded px-2 py-1 bg-white"
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                    </select>
                    <span>dòng / trang</span>
                </div>

                <button
                    onClick={onReset}
                    className="border border-admin-outline-variant text-admin-on-surface bg-white px-admin-md py-2 rounded font-bold hover:bg-admin-surface-container transition-colors flex items-center gap-2 shadow-sm font-admin-sans text-admin-body-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Xoá bộ lọc
                </button>
            </div>
        </div>
    );
}
