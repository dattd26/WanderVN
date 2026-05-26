import { useState } from 'react'; // ✅ THÊM useState
import { createPortal } from 'react-dom';
import type { UserDto } from '../../../types';
import { ChangePasswordPartner } from './ChangePasswordPartner'; // ✅ THÊM import

interface PartnerModalProps {
    isOpen: boolean;
    partner: UserDto | null;
    onClose: () => void;
}

export function PartnerModal({ isOpen, partner, onClose }: PartnerModalProps) {
    // ✅ THÊM: state mở modal đổi mật khẩu
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    if (!isOpen || !partner) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-admin-lg bg-primary/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative bg-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-admin-xl py-admin-lg border-b border-admin-outline-variant bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-admin-md">
                        <div className="w-12 h-12 rounded bg-admin-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-admin-secondary">hotel</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-admin-sm">
                                <h2 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
                                    {partner.fullName || '(Chưa có tên)'}
                                </h2>
                                <span className="px-2 py-0.5 bg-admin-surface-variant text-[10px] font-bold rounded uppercase tracking-wider font-admin-sans">
                                    Partner
                                </span>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider font-admin-sans ${partner.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-error-container text-error'
                                    }`}>
                                    {partner.isActive ? 'Active' : 'Locked'}
                                </span>
                            </div>
                            <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                                Partner ID: <span className="font-admin-mono">PRT-{partner.id}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-admin-surface-container rounded-full transition-colors text-admin-on-surface-variant hover:text-error"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-admin-xl space-y-admin-xl custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-admin-xl">

                        {/* General Information */}
                        <section className="space-y-admin-md">
                            <h3 className="font-admin-sans text-admin-label-caps text-admin-secondary border-b border-admin-outline-variant pb-admin-xs uppercase">
                                General Information
                            </h3>
                            <div className="space-y-admin-sm">
                                <div>
                                    <p className="text-[10px] text-admin-on-surface-variant font-bold uppercase tracking-tighter font-admin-sans">
                                        Họ và tên
                                    </p>
                                    <p className="font-admin-sans text-admin-body-md text-admin-primary">
                                        {partner.fullName || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-admin-on-surface-variant font-bold uppercase tracking-tighter font-admin-sans">
                                        Email
                                    </p>
                                    <p className="font-admin-sans text-admin-body-md text-admin-primary">
                                        {partner.email || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-admin-on-surface-variant font-bold uppercase tracking-tighter font-admin-sans">
                                        Số điện thoại
                                    </p>
                                    <p className="font-admin-sans text-admin-body-md text-admin-primary">
                                        {partner.phoneNumber || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-admin-on-surface-variant font-bold uppercase tracking-tighter font-admin-sans">
                                        Ngày tham gia
                                    </p>
                                    <p className="font-admin-mono text-admin-body-md text-admin-primary">
                                        {partner.createdAt
                                            ? new Date(partner.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                            })
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Service Details */}
                        <section className="space-y-admin-md">
                            <h3 className="font-admin-sans text-admin-label-caps text-admin-secondary border-b border-admin-outline-variant pb-admin-xs uppercase">
                                Service Details
                            </h3>
                            <div className="space-y-admin-sm">
                                <div>
                                    <p className="text-[10px] text-admin-on-surface-variant font-bold uppercase tracking-tighter font-admin-sans">
                                        Vai trò
                                    </p>
                                    <p className="font-admin-sans text-admin-body-md text-admin-primary">
                                        {partner.roleName || 'Partner'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-admin-on-surface-variant font-bold uppercase tracking-tighter font-admin-sans">
                                        Trạng thái
                                    </p>
                                    <span className={`inline-flex items-center gap-admin-xs px-admin-sm py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider font-admin-sans ${partner.isActive
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-error-container text-error border-error/20'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${partner.isActive ? 'bg-green-500' : 'bg-error'}`} />
                                        {partner.isActive ? 'Active' : 'Locked'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-admin-on-surface-variant font-bold uppercase tracking-tighter font-admin-sans">
                                        Avatar URL
                                    </p>
                                    {partner.avatarUrl ? (
                                        <img
                                            src={partner.avatarUrl}
                                            alt={partner.fullName || ''}
                                            className="w-16 h-16 rounded-full border border-admin-outline-variant object-cover mt-1 shadow-sm"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-admin-primary-container flex items-center justify-center text-admin-on-primary font-bold text-xl mt-1 shadow-sm">
                                            {partner.fullName?.slice(0, 2).toUpperCase() ?? '??'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Documents */}
                        <section className="space-y-admin-md md:col-span-2">
                            <h3 className="font-admin-sans text-admin-label-caps text-admin-secondary border-b border-admin-outline-variant pb-admin-xs uppercase">
                                Documents
                            </h3>
                            <div className="space-y-admin-xs">
                                {[
                                    { icon: 'description', name: 'Business_License_2023.pdf' },
                                    { icon: 'shield', name: 'Insurance_Certificate.pdf' },
                                    { icon: 'image', name: 'Property_Profile.zip' },
                                ].map((doc) => (
                                    <div
                                        key={doc.name}
                                        className="flex items-center justify-between p-admin-sm border border-admin-outline-variant rounded-lg hover:bg-white transition-colors"
                                    >
                                        <div className="flex items-center gap-admin-sm">
                                            <span className="material-symbols-outlined text-admin-on-surface-variant text-[20px]">
                                                {doc.icon}
                                            </span>
                                            <span className="font-admin-sans text-admin-body-sm text-admin-primary">
                                                {doc.name}
                                            </span>
                                        </div>
                                        <button className="p-1 text-admin-secondary hover:bg-admin-secondary-container/10 rounded transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>

                {/* Footer — ✅ THÊM nút Đổi mật khẩu, giữ nguyên nút Đóng */}
                <div className="px-admin-xl py-admin-lg border-t border-admin-outline-variant bg-admin-surface-container-lowest flex justify-between items-center shrink-0 select-none">
                    {/* ✅ THÊM: Nút đổi mật khẩu bên trái */}
                    <button
                        type="button"
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="flex items-center gap-admin-sm px-admin-lg py-admin-sm bg-admin-secondary-container text-admin-on-secondary-container font-admin-sans text-admin-body-md font-bold rounded-lg hover:bg-admin-secondary/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                        Đổi mật khẩu
                    </button>

                    {/* Nút Đóng bên phải — giữ nguyên */}
                    <button
                        onClick={onClose}
                        className="px-admin-xl py-admin-sm font-admin-sans text-admin-body-md font-bold text-admin-on-surface-variant hover:bg-admin-surface-container-high rounded-lg transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* ✅ THÊM: Modal đổi mật khẩu — z-index cao hơn để hiển thị trên PartnerModal */}
            <ChangePasswordPartner
                isOpen={isChangePasswordOpen}
                partnerName={partner.fullName || '(Chưa có tên)'}
                partnerId={partner.id}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>,
        document.body
    );
}