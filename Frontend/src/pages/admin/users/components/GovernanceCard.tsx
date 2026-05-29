import React from 'react';

export const GovernanceCard = React.memo(function GovernanceCard() {
    return (
        <div className="bg-admin-primary-container p-admin-xl rounded-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-admin-xl">
                <div className="max-w-xl">
                    <h4 className="font-admin-sans text-admin-headline-sm text-admin-on-primary mb-admin-sm">
                        Hệ Thống Quản Trị Tự Động
                    </h4>
                    <p className="text-admin-on-primary-container text-admin-body-md opacity-90 leading-relaxed font-admin-sans">
                        Hệ thống WanderVN đang tự động giám sát các hành vi bất thường. Bạn có thể xem lại
                        các tài khoản bị khoá tự động tại Bảng điều khiển Bảo mật.
                    </p>
                </div>
                <button className="px-admin-xl py-admin-md bg-white text-admin-primary font-bold rounded-lg shadow-xl hover:bg-admin-surface-bright transition-all whitespace-nowrap font-admin-sans">
                    Xem Cảnh Báo Bảo Mật
                </button>
            </div>
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }}
            />
        </div>
    );
});