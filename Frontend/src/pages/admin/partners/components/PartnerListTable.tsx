import type { UserDto } from '../../../../types';

interface PartnerListTableProps {
    partners: UserDto[];
    isLoading: boolean;
    error: string | null;
    pageSize: number;
    onRetry: () => void;
    onTogglePartner: (id: number, currentStatus: boolean) => void;
    onViewPartner: (partner: UserDto) => void;
}

export function PartnerListTable({
    partners,
    isLoading,
    error,
    pageSize,
    onRetry,
    onTogglePartner,
    onViewPartner,
}: PartnerListTableProps) {
    return (
        <div className="p-0 animate-fade-in">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-admin-surface-container-low border-b border-admin-outline-variant select-none">
                            <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">PARTNER NAME</th>
                            <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">TYPE</th>
                            <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">PHONE</th>
                            <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">JOINED DATE</th>
                            <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">REVENUE</th>
                            <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-center">STATUS</th>
                            <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-outline-variant">
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, idx) => (
                                <tr key={`skeleton-${idx}`} className="animate-pulse">
                                    <td colSpan={7} className="px-admin-lg py-admin-lg">
                                        <div className="h-6 bg-admin-surface-container rounded w-full" />
                                    </td>
                                </tr>
                            ))
                        ) : error ? (
                            <tr>
                                <td colSpan={7} className="px-admin-lg py-admin-xl text-center font-admin-sans">
                                    <div className="flex flex-col items-center gap-admin-md">
                                        <span className="material-symbols-outlined text-error text-4xl">error</span>
                                        <p className="text-error">{error}</p>
                                        <button
                                            onClick={onRetry}
                                            className="px-admin-md py-admin-sm bg-admin-primary text-white font-bold rounded hover:bg-admin-on-background transition-colors"
                                        >
                                            Thử lại
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : partners.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant font-admin-sans">
                                    Không có đối tác nào.
                                </td>
                            </tr>
                        ) : (
                            partners.map((partner) => (
                                <tr
                                    key={partner.id}
                                    className={`hover:bg-admin-surface-container-lowest transition-colors ${!partner.isActive ? 'opacity-75' : ''}`}
                                >
                                    <td className="px-admin-lg py-admin-lg">
                                        <div className="flex items-center gap-admin-md">
                                            {partner.avatarUrl ? (
                                                <img
                                                    src={partner.avatarUrl}
                                                    alt={partner.fullName || partner.email}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {(partner.fullName || partner.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-admin-sans text-admin-body-md font-bold text-admin-primary">
                                                    {partner.fullName || '(Chưa cập nhật)'}
                                                </span>
                                                <span className="text-xs text-admin-on-surface-variant">
                                                    {partner.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-admin-lg py-admin-lg">
                                        <span className="px-2 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wider bg-admin-secondary-fixed text-admin-on-secondary-fixed-variant">
                                            {partner.roleName || 'Partner'}
                                        </span>
                                    </td>
                                    <td className="px-admin-lg py-admin-lg font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
                                        {partner.phoneNumber || '—'}
                                    </td>
                                    <td className="px-admin-lg py-admin-lg font-admin-mono text-xs text-admin-on-surface-variant">
                                        {partner.createdAt?.split('T')[0] || '—'}
                                    </td>
                                    <td className="px-admin-lg py-admin-lg font-admin-sans text-admin-body-md font-bold text-green-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(partner.totalRevenue || 0)}
                                    </td>
                                    <td className="px-admin-lg py-admin-lg">
                                        <div className="flex items-center justify-center select-none">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={partner.isActive || false}
                                                    onChange={() => onTogglePartner(partner.id, partner.isActive || false)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-admin-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-secondary"></div>
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-admin-lg py-admin-lg text-right">
                                        <button
                                            onClick={() => onViewPartner(partner)}
                                            className="p-2 text-admin-on-surface-variant hover:text-admin-secondary hover:bg-admin-surface-container-high rounded-lg transition-colors"
                                            title="Xem chi tiết đối tác"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
