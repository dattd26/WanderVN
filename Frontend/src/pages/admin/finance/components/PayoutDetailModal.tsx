import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { PayoutDto } from '../../../../types';

interface PayoutDetailModalProps {
    isOpen: boolean;
    payout: PayoutDto | null;
    onClose: () => void;
}

export const PayoutDetailModal: React.FC<PayoutDetailModalProps> = ({ isOpen, payout, onClose }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    
    const [render, setRender] = useState(isOpen);
    const [copied, setCopied] = useState(false);

    if (isOpen && !render) {
        setRender(true);
    }

    useEffect(() => {
        if (!render || !payout) return;

        // Thiết lập hiệu ứng GSAP khi mở modal
        const ctx = gsap.context(() => {
            gsap.fromTo(overlayRef.current, 
                { opacity: 0 }, 
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(modalRef.current,
                { scale: 0.9, y: 30, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
            );
        });

        // Hủy đăng ký GSAP khi component unmount
        return () => ctx.revert();
    }, [render, payout]);

    if (!render || !payout) return null;

    const handleClose = () => {
        // Chạy hiệu ứng đóng modal bằng GSAP trước khi hủy render
        gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
        });
        gsap.to(modalRef.current, {
            scale: 0.95,
            y: 15,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => {
                setRender(false);
                onClose();
            }
        });
    };

    const handleCopy = () => {
        const text = 
            `CHI TIẾT KHOẢN CHI TRẢ #${payout.id}\n` +
            `-----------------------------------\n` +
            `• Đối tác: ${payout.partnerName ?? 'N/A'} (${payout.partnerEmail ?? '—'})\n` +
            `• Mã Booking: ${payout.bookingCode} [${payout.serviceType}]\n` +
            `• Trạng thái Booking: ${payout.bookingStatus ?? '—'}\n` +
            `• Trạng thái Thanh toán: ${payout.paymentStatus ?? '—'}\n` +
            `• Doanh thu (Gross): ${payout.grossAmount.toLocaleString('vi-VN')}₫\n` +
            `• Phí hoa hồng: ${payout.commissionAmount.toLocaleString('vi-VN')}₫\n` +
            `• Thực nhận (Net): ${payout.netAmount.toLocaleString('vi-VN')}₫\n` +
            `• Phương thức: ${payout.payoutMethod}\n` +
            `• Trạng thái: ${payout.status === 'Pending' ? 'Chờ thanh toán' : payout.status === 'Processing' ? 'Đang xử lý' : payout.status === 'Paid' ? 'Đã chi trả' : payout.status === 'Failed' ? 'Thất bại' : payout.status === 'Cancelled' ? 'Đã hủy' : payout.status}\n` +
            (payout.checkedOutAt ? `• Ngày Checkout: ${new Date(payout.checkedOutAt).toLocaleString('vi-VN')}\n` : '') +
            (payout.paidAt ? `• Ngày Chi trả: ${new Date(payout.paidAt).toLocaleString('vi-VN')}\n` : '') +
            (payout.transactionReference ? `• Tham chiếu/Lý do: ${payout.transactionReference}\n` : '') +
            `• Tạo lúc: ${new Date(payout.createdAt).toLocaleString('vi-VN')}`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatVnd = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

    const getBookingStatusLabel = (status?: string | null) => {
        if (!status) return '—';
        const mapping: Record<string, string> = {
            Pending: 'Chờ thanh toán',
            Confirmed: 'Đã xác nhận',
            Completed: 'Đã hoàn thành',
            Cancelled: 'Đã hủy',
            SettlementPending: 'Chờ đối soát',
            Settled: 'Đã đối soát',
            CheckedIn: 'Đang lưu trú',
            CheckedOut: 'Đã Check-out',
            NoShow: 'Không nhận phòng',
        };
        return mapping[status] ?? status;
    };

    const getPaymentStatusLabel = (status?: string | null) => {
        if (!status) return '—';
        const mapping: Record<string, string> = {
            Unpaid: 'Chưa trả',
            Paid: 'Đã thanh toán',
            Failed: 'Thất bại',
        };
        return mapping[status] ?? status;
    };

    return (
        <div 
            ref={overlayRef}
            onClick={handleClose}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-admin-primary/60 backdrop-blur-sm overflow-y-auto"
        >
            <div 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-2xl w-full max-w-[580px] shadow-2xl overflow-hidden font-admin-sans"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-admin-xl py-admin-lg border-b border-admin-outline-variant/60 bg-admin-surface-container-low select-none">
                    <div className="flex items-center gap-admin-sm">
                        <span className="material-symbols-outlined text-admin-secondary">receipt_long</span>
                        <div>
                            <h2 className="text-admin-title-md font-bold text-admin-primary">Chi Tiết Khoản Chi Trả</h2>
                            <p className="text-[10px] text-admin-outline font-admin-mono mt-0.5">
                                ID: #{payout.id} &bull; Tạo lúc: {new Date(payout.createdAt).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-block px-admin-sm py-[2px] rounded text-[10px] font-bold uppercase ${
                            payout.status === 'Paid' ? 'bg-green-100 text-green-800 border border-green-200' :
                            payout.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            payout.status === 'Processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            payout.status === 'Failed' ? 'bg-error-container text-on-error-container border border-error/10' :
                            'bg-admin-surface-variant text-admin-on-surface-variant border border-admin-outline-variant/30'
                        }`}>
                            {payout.status === 'Pending' ? 'Chờ thanh toán' : payout.status === 'Processing' ? 'Đang xử lý' : payout.status === 'Paid' ? 'Đã chi trả' : payout.status === 'Failed' ? 'Thất bại' : payout.status === 'Cancelled' ? 'Đã hủy' : payout.status}
                        </span>
                        <button 
                            onClick={handleClose} 
                            className="p-admin-sm text-admin-outline hover:text-admin-on-surface transition-colors rounded-full hover:bg-admin-outline-variant/30 flex"
                        >
                            <span className="material-symbols-outlined text-admin-title-md">close</span>
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-admin-xl flex flex-col gap-admin-lg">
                    {/* Phần 1: Đối tác & Booking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-admin-md select-none">
                        {/* Đối tác */}
                        <div className="bg-admin-surface-container-low p-admin-md rounded-xl border border-admin-outline-variant/40 space-y-2">
                            <div className="flex items-center gap-admin-xs text-admin-label-caps text-admin-outline font-bold uppercase">
                                <span className="material-symbols-outlined text-[16px]">person</span>
                                Đối tác nhận
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-admin-body-md text-admin-on-surface truncate">{payout.partnerName ?? 'N/A'}</p>
                                <p className="text-admin-body-sm text-admin-outline truncate flex items-center gap-1 mt-0.5">
                                    <span className="material-symbols-outlined text-[14px]">mail</span>
                                    {payout.partnerEmail ?? '—'}
                                </p>
                            </div>
                            <div className="pt-2 border-t border-admin-outline-variant/30 flex items-center justify-between text-admin-body-sm">
                                <span className="text-admin-outline">Phương thức:</span>
                                <span className="font-bold text-admin-on-surface">{payout.payoutMethod}</span>
                            </div>
                        </div>

                        {/* Booking */}
                        <div className="bg-admin-surface-container-low p-admin-md rounded-xl border border-admin-outline-variant/40 space-y-2">
                            <div className="flex items-center gap-admin-xs text-admin-label-caps text-admin-outline font-bold uppercase">
                                <span className="material-symbols-outlined text-[16px]">payment</span>
                                Giao dịch đặt chỗ
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-admin-mono font-bold text-admin-body-md text-admin-on-surface">{payout.bookingCode}</p>
                                    <p className="text-[10px] text-admin-outline font-admin-sans mt-0.5 flex items-center gap-1 uppercase">
                                        <span className="material-symbols-outlined text-[12px]">
                                            {payout.serviceType === 'Hotel' ? 'hotel' : 
                                             payout.serviceType === 'Flight' ? 'flight' : 
                                             payout.serviceType === 'Bus' ? 'directions_bus' : 
                                             payout.serviceType === 'Restaurant' ? 'restaurant' : 
                                             payout.serviceType === 'Cruise' ? 'directions_boat' : 'storefront'}
                                        </span>
                                        {payout.serviceType}
                                    </p>
                                </div>
                                <span className="inline-block px-1.5 py-[2px] rounded text-[9px] font-bold uppercase font-admin-sans bg-admin-secondary-container/30 text-admin-on-secondary-container max-w-full truncate">
                                    {getBookingStatusLabel(payout.bookingStatus)}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-admin-outline-variant/30 flex items-center justify-between text-admin-body-sm">
                                <span className="text-admin-outline">Thanh toán:</span>
                                <span className={`inline-block px-1.5 py-[2px] rounded text-[9px] font-bold uppercase font-admin-sans ${
                                    payout.paymentStatus?.toLowerCase() === 'paid' || payout.paymentStatus?.toLowerCase() === 'confirmed' || payout.paymentStatus?.toLowerCase() === 'settled'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-error-container text-on-error-container'
                                }`}>
                                    {getPaymentStatusLabel(payout.paymentStatus)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Phần 2: Hóa đơn chi tiết */}
                    <div className="bg-admin-surface-container-low p-admin-lg rounded-xl border border-admin-outline-variant/40 select-none">
                        <div className="flex items-center gap-admin-xs text-admin-label-caps text-admin-outline font-bold uppercase mb-3">
                            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                            Chi tiết doanh thu
                        </div>
                        <div className="space-y-2 text-admin-body-sm">
                            <div className="flex justify-between items-center text-admin-on-surface-variant">
                                <span>Doanh thu (Gross):</span>
                                <span className="font-admin-mono font-semibold">{formatVnd(payout.grossAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-error font-bold">
                                <span>Phí hoa hồng nền tảng:</span>
                                <span className="font-admin-mono">-{formatVnd(payout.commissionAmount)}</span>
                            </div>
                            <div className="pt-2 border-t border-dashed border-admin-outline-variant/60 flex justify-between items-center text-admin-secondary">
                                <span className="font-bold">Thực nhận (Net):</span>
                                <span className="font-admin-mono text-admin-title-md font-bold">{formatVnd(payout.netAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Phần 3: Trạng thái & Mốc thời gian */}
                    <div className="bg-admin-surface-container-low/60 p-admin-md rounded-xl border border-admin-outline-variant/20 text-admin-body-sm text-admin-on-surface-variant">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {payout.checkedOutAt && (
                                <div className="flex justify-between sm:justify-start sm:gap-2">
                                    <span className="text-admin-outline flex items-center gap-1 select-none">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        Checkout:
                                    </span>
                                    <span className="font-semibold text-admin-on-surface">{new Date(payout.checkedOutAt).toLocaleString('vi-VN')}</span>
                                </div>
                            )}
                            {payout.paidAt && (
                                <div className="flex justify-between sm:justify-start sm:gap-2">
                                    <span className="text-admin-outline flex items-center gap-1 select-none">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        Đã chi trả:
                                    </span>
                                    <span className="font-semibold text-admin-on-surface">{new Date(payout.paidAt).toLocaleString('vi-VN')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Phần 4: Tham chiếu / Lý do từ chối nếu có */}
                    {payout.transactionReference && (
                        <div className="bg-amber-50 border border-amber-200 p-admin-md rounded-xl flex items-start gap-admin-sm text-admin-body-sm text-amber-900">
                            <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0 mt-0.5">info</span>
                            <div className="space-y-1">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block select-none">
                                    Tham chiếu giao dịch / Lý do từ chối:
                                </span>
                                <p className="leading-relaxed font-admin-mono break-all bg-white/60 p-2 rounded border border-amber-200/30 mt-1 select-text">
                                    {payout.transactionReference}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Hành động */}
                    <div className="flex justify-end gap-admin-md border-t border-admin-outline-variant/60 pt-admin-lg select-none">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="px-admin-xl py-admin-md border border-admin-outline-variant rounded-lg font-bold text-admin-outline hover:text-admin-primary hover:bg-admin-outline-variant/20 transition-all flex items-center gap-admin-xs text-xs"
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                {copied ? 'check' : 'content_copy'}
                            </span>
                            {copied ? 'Đã sao chép' : 'Sao chép chi tiết'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-admin-xl py-admin-md bg-admin-primary text-white rounded-lg font-bold hover:opacity-90 transition-all text-xs"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
