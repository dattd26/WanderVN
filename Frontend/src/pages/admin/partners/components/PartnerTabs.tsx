export type PartnerTabKey = 'pending' | 'list' | 'hotel-review';

interface PartnerTabsProps {
    activeTab: PartnerTabKey;
    onChange: (tab: PartnerTabKey) => void;
}

const TABS: Array<{ key: PartnerTabKey; label: string }> = [
    { key: 'list', label: 'Danh sách đối tác' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'hotel-review', label: 'Duyệt hồ sơ khách sạn' },
];

export function PartnerTabs({ activeTab, onChange }: PartnerTabsProps) {
    return (
        <div className="flex border-b border-admin-outline-variant px-admin-lg bg-admin-surface-container-lowest select-none">
            {TABS.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`px-admin-xl py-admin-lg font-admin-sans text-admin-body-md transition-all ${activeTab === tab.key
                        ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
                        : 'text-admin-on-surface-variant hover:text-admin-primary'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
