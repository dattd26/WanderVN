interface PartnerApplication {
    id: string;
    name: string;
    type: 'Stay' | 'Flight';
    time: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    icon: string;
}

interface PartnerPendingTabProps {
    applications: PartnerApplication[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onViewProfile?: (id: string) => void;
}

export function PartnerPendingTab({
    applications,
    onApprove,
    onReject,
    onViewProfile,
}: PartnerPendingTabProps) {
    if (applications.length === 0) {
        return (
            <div className="p-admin-lg">
                <div className="p-admin-lg text-center text-admin-on-surface-variant font-admin-sans">
                    No applications pending approval.
                </div>
            </div>
        );
    }

    return (
        <div className="p-admin-lg">
            <div className="space-y-admin-md">
                {applications.map((app) => {
                    const isApproved = app.status === 'Approved';
                    const isRejected = app.status === 'Rejected';

                    return (
                        <div
                            key={app.id}
                            className="flex items-center justify-between p-admin-lg border border-admin-outline-variant rounded-lg hover:shadow-md transition-all bg-white group"
                            style={{ opacity: isApproved || isRejected ? 0.6 : 1 }}
                        >
                            <div className="flex items-center gap-admin-lg">
                                <div className="w-16 h-16 rounded bg-admin-surface-container flex items-center justify-center">
                                    <span className="material-symbols-outlined text-admin-secondary scale-125">
                                        {app.icon}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-admin-sm">
                                        <h3 className="font-admin-sans text-admin-body-lg font-bold text-admin-primary">
                                            {app.name}
                                        </h3>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${app.type === 'Stay' ? 'bg-admin-surface-variant text-admin-on-surface' : 'bg-admin-secondary-fixed text-admin-on-secondary-fixed-variant'}`}>
                                            {app.type}
                                        </span>
                                    </div>
                                    <p className="text-admin-body-sm text-admin-on-surface-variant mt-1 font-admin-sans">
                                        Application ID: <span className="font-admin-mono">{app.id}</span> • {app.time}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-admin-md font-admin-sans select-none">
                                {app.status === 'Pending' ? (
                                    <>
                                        <button
                                            onClick={() => onViewProfile?.(app.id)}
                                            className="px-admin-md py-admin-sm font-body-md font-bold text-admin-secondary hover:bg-admin-secondary-container/10 rounded transition-colors"
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => onApprove?.(app.id)}
                                            className="px-admin-md py-admin-sm bg-admin-primary text-white font-bold rounded hover:bg-admin-on-background transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => onReject?.(app.id)}
                                            className="px-admin-md py-admin-sm border border-error text-error font-bold rounded hover:bg-error-container transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-admin-lg py-admin-sm font-bold text-sm ${isApproved ? 'text-green-600' : 'text-error'}`}>
                                        {app.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
