interface PartnerStatsCardsProps {
    totalPartners: number;
    pendingCount: number;
    activeCount: number;
    inactiveCount: number;
}

export function PartnerStatsCards({
    totalPartners,
    pendingCount,
    activeCount,
    inactiveCount,
}: PartnerStatsCardsProps) {
    const cards = [
        { label: 'TỔNG ĐỐI TÁC', value: totalPartners, borderTop: 'border-t-admin-secondary' },
        { label: 'CHỜ DUYỆT', value: pendingCount, borderTop: 'border-t-admin-tertiary-fixed-dim' },
        { label: 'ĐANG HOẠT ĐỘNG', value: activeCount, borderTop: 'border-t-admin-secondary-container' },
        { label: 'ĐÃ KHÓA', value: inactiveCount, borderTop: 'border-t-admin-primary' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-admin-lg select-none">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 ${card.borderTop} shadow-sm`}
                >
                    <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
                        {card.label}
                    </p>
                    <div className="flex items-baseline gap-admin-sm">
                        <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
                            {card.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
