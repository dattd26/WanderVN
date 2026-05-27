interface PartnerTabsProps {
    activeTab: 'pending' | 'list';
    onChange: (tab: 'pending' | 'list') => void;
}

export function PartnerTabs({ activeTab, onChange }: PartnerTabsProps) {
    return (
        <div className="flex border-b border-admin-outline-variant px-admin-lg bg-admin-surface-container-lowest select-none">
            <button
                onClick={() => onChange('list')}
                className={`px-admin-xl py-admin-lg font-admin-sans text-admin-body-md transition-all ${activeTab === 'list'
                    ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
                    : 'text-admin-on-surface-variant hover:text-admin-primary'
                    }`}
            >
                Partner List
            </button>
            <button
                onClick={() => onChange('pending')}
                className={`px-admin-xl py-admin-lg font-admin-sans text-admin-body-md transition-all ${activeTab === 'pending'
                    ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
                    : 'text-admin-on-surface-variant hover:text-admin-primary'
                    }`}
            >
                Pending Approval
            </button>
        </div>
    );
}
