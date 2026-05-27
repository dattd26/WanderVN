import type { UserDto } from '../../../../types';

interface UserTableBodyProps {
    users: UserDto[];
    isLoading: boolean;
    error: string | null;
    pageSize: number;
    currentPage: number;
    onRetry: () => void;
    onViewUser: (id: number) => void;
    onToggleLock: (id: number, currentActive: boolean) => void;
    onDeleteUser: (id: number, email: string) => void;
}

const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
};

export function UserTableBody({
    users,
    isLoading,
    error,
    pageSize,
    currentPage,
    onRetry,
    onViewUser,
    onToggleLock,
    onDeleteUser,
}: UserTableBodyProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-admin-surface-container-low border-b border-admin-outline-variant select-none">
                        <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">STT</th>
                        <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">Người dùng</th>
                        <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">Liên hệ</th>
                        <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">Trạng thái</th>
                        <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-admin-outline-variant/30">
                    {isLoading ? (
                        Array.from({ length: pageSize }).map((_, i) => (
                            <tr key={`skeleton-${i}`} className="animate-pulse">
                                <td className="px-admin-lg py-admin-md">
                                    <div className="h-4 w-16 bg-admin-surface-container-low rounded" />
                                </td>
                                <td className="px-admin-lg py-admin-md">
                                    <div className="flex items-center gap-admin-md">
                                        <div className="w-10 h-10 rounded-full bg-admin-surface-container-low" />
                                        <div className="space-y-1.5">
                                            <div className="h-4 w-32 bg-admin-surface-container-low rounded" />
                                            <div className="h-3 w-20 bg-admin-surface-container-low rounded" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-admin-lg py-admin-md">
                                    <div className="space-y-1.5">
                                        <div className="h-4 w-40 bg-admin-surface-container-low rounded" />
                                        <div className="h-3 w-28 bg-admin-surface-container-low rounded" />
                                    </div>
                                </td>
                                <td className="px-admin-lg py-admin-md">
                                    <div className="h-5 w-16 bg-admin-surface-container-low rounded-full" />
                                </td>
                                <td className="px-admin-lg py-admin-md">
                                    <div className="h-6 w-8 bg-admin-surface-container-low rounded ml-auto" />
                                </td>
                            </tr>
                        ))
                    ) : error ? (
                        <tr>
                            <td colSpan={5} className="px-admin-lg py-admin-xl text-center">
                                <div className="flex flex-col items-center gap-admin-md">
                                    <span className="material-symbols-outlined text-error text-[40px]">error</span>
                                    <p className="text-error font-admin-sans font-bold">{error}</p>
                                    <button
                                        onClick={onRetry}
                                        className="px-admin-lg py-admin-sm bg-admin-primary-container text-admin-on-primary font-bold rounded-lg hover:bg-admin-primary transition-all"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : users.length > 0 ? (
                        users.map((user, index) => {
                            const stt = (currentPage - 1) * pageSize + index + 1;
                            return (
                                <tr key={user.id} className="hover:bg-admin-surface-container-low transition-colors group">
                                    <td className="px-admin-lg py-admin-md font-admin-mono text-admin-data-mono text-admin-on-surface-variant">
                                        {stt}
                                    </td>
                                    <td className="px-admin-lg py-admin-md">
                                        <div className="flex items-center gap-admin-md">
                                            {user.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.fullName || ''}
                                                    className={`w-10 h-10 rounded-full border border-admin-outline-variant object-cover shadow-sm ${user.isActive === false ? 'grayscale opacity-80' : ''}`}
                                                />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full bg-admin-primary-container flex items-center justify-center text-admin-on-primary font-bold text-sm ${user.isActive === false ? 'opacity-60' : ''}`}>
                                                    {getInitials(user.fullName)}
                                                </div>
                                            )}
                                            <div>
                                                <p className={`font-admin-sans text-admin-body-md font-bold ${user.isActive === false ? 'text-admin-on-surface-variant' : 'text-admin-on-surface'}`}>
                                                    {user.fullName || '(Chưa có tên)'}
                                                </p>
                                                <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                                                    {formatDate(user.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-admin-lg py-admin-md">
                                        <p className={`font-admin-sans text-admin-body-md ${user.isActive === false ? 'text-admin-on-surface-variant' : 'text-admin-on-surface'}`}>
                                            {user.email}
                                        </p>
                                        <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                                            {user.phoneNumber || '—'}
                                        </p>
                                    </td>
                                    <td className="px-admin-lg py-admin-md">
                                        {user.isActive !== false ? (
                                            <span className="inline-flex items-center gap-admin-xs px-admin-sm py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold border border-green-200 uppercase tracking-wider font-admin-sans">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-admin-xs px-admin-sm py-0.5 rounded-full bg-error-container text-error text-[11px] font-bold border border-error/20 uppercase tracking-wider font-admin-sans">
                                                <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
                                                Locked
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-admin-lg py-admin-md">
                                        <div className="flex justify-end gap-admin-sm opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onViewUser(user.id)}
                                                className="p-1 hover:bg-admin-surface-container-high rounded-lg text-admin-primary transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                            <button
                                                onClick={() => onToggleLock(user.id, user.isActive !== false)}
                                                className={`p-1 hover:bg-admin-surface-container-high rounded-lg transition-colors ${user.isActive !== false ? 'text-amber-500 hover:text-amber-700' : 'text-green-600 hover:text-green-800'}`}
                                                title={user.isActive !== false ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {user.isActive !== false ? 'lock' : 'lock_open'}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => onDeleteUser(user.id, user.email)}
                                                className="p-1 hover:bg-admin-surface-container-high rounded-lg text-red-500 hover:text-red-700 transition-colors"
                                                title="Xoá người dùng"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant font-admin-sans">
                                Không tìm thấy người dùng nào phù hợp.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}