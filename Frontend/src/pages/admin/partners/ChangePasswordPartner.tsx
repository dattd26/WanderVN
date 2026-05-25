import { useState } from 'react';
import { createPortal } from 'react-dom';
import { userService } from '../../../services';

interface ChangePasswordPartnerProps {
    isOpen: boolean;
    partnerName: string;
    partnerId: string | number;
    onClose: () => void;
}

export function ChangePasswordPartner({
    isOpen,
    partnerName,
    partnerId,
    onClose,
}: ChangePasswordPartnerProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!newPassword.trim()) {
            setError('Vui lòng nhập mật khẩu mới.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Xác nhận mật khẩu không khớp.');
            return;
        }

        setIsSaving(true);
        try {
            await userService.changePartnerPassword(Number(partnerId), {
                newPassword,
            });
            setSuccessMsg(`Đã cập nhật mật khẩu cho ${partnerName}.`);
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setSuccessMsg(null);
                onClose();
            }, 1000);
        } catch (err: any) {
            setError(err?.message || 'Có lỗi xảy ra khi cập nhật mật khẩu.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccessMsg(null);
        onClose();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-[480px] bg-white rounded-xl shadow-2xl border border-admin-outline-variant overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-admin-xl pt-admin-xl pb-admin-lg bg-white border-b border-admin-outline-variant">
                    <div className="flex justify-between items-start mb-admin-sm">
                        <h3 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
                            Đổi mật khẩu Đối tác
                        </h3>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="p-admin-xs text-admin-on-surface-variant hover:bg-admin-surface-container-high rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-admin-sm">
                        <span className="material-symbols-outlined text-admin-secondary text-[18px]">badge</span>
                        <p className="font-admin-sans text-admin-body-md text-admin-on-surface-variant">
                            <span className="font-bold text-admin-on-surface">{partnerName}</span>
                            <span className="mx-admin-xs text-admin-outline">|</span>
                            <span className="font-admin-mono text-admin-secondary text-[12px]">PRT-{partnerId}</span>
                        </p>
                    </div>
                </div>

                {/* Modal Form Body */}
                <form id="password-form" onSubmit={handleSubmit} className="px-admin-xl py-admin-lg space-y-admin-lg">

                    {error && (
                        <div className="flex items-center gap-admin-sm p-admin-md bg-error-container border border-error/20 rounded-lg text-error text-admin-body-sm font-admin-sans">
                            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="flex items-center gap-admin-sm p-admin-md bg-green-50 border border-green-200 rounded-lg text-green-800 text-admin-body-sm font-admin-sans">
                            <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Mật khẩu mới */}
                    <div className="space-y-admin-xs">
                        <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface">
                            Mật khẩu mới
                        </label>
                        <div className="relative group">
                            <span className="absolute left-admin-md top-1/2 -translate-y-1/2 material-symbols-outlined text-admin-outline group-focus-within:text-admin-secondary transition-colors text-[20px]">
                                lock
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-[44px] pr-admin-xl py-admin-md bg-white border border-admin-outline-variant rounded-lg font-admin-sans text-admin-body-md focus:border-admin-secondary focus:ring-2 focus:ring-admin-secondary/20 outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-admin-md top-1/2 -translate-y-1/2 text-admin-outline hover:text-admin-on-surface-variant transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="space-y-admin-xs">
                        <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative group">
                            <span className="absolute left-admin-md top-1/2 -translate-y-1/2 material-symbols-outlined text-admin-outline group-focus-within:text-admin-secondary transition-colors text-[20px]">
                                verified_user
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-[44px] pr-admin-md py-admin-md bg-white border border-admin-outline-variant rounded-lg font-admin-sans text-admin-body-md focus:border-admin-secondary focus:ring-2 focus:ring-admin-secondary/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Policy Hint */}
                    <div className="flex gap-admin-sm p-admin-md bg-admin-primary-fixed-dim/10 rounded-lg">
                        <span className="material-symbols-outlined text-admin-on-primary-container text-[18px] shrink-0">info</span>
                        <p className="text-[12px] leading-relaxed text-admin-on-primary-container font-admin-sans">
                            Mật khẩu phải có ít nhất 6 ký tự.
                        </p>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="px-admin-xl py-admin-lg bg-admin-surface-container-lowest flex justify-end items-center gap-admin-md border-t border-admin-outline-variant">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSaving}
                        className="px-admin-lg py-admin-md text-admin-on-surface-variant font-admin-sans text-admin-body-md font-bold hover:bg-admin-surface-container-high rounded-lg transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="password-form"
                        disabled={isSaving}
                        className="px-admin-lg py-admin-md bg-admin-primary-container text-white font-admin-sans text-admin-body-md font-bold rounded-lg hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                                Cập nhật mật khẩu
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
