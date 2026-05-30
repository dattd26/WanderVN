
export function AdminSettings() {
    return (
        <div className="p-admin-lg max-w-admin-container-max mx-auto w-full">
            <div className="mb-admin-xl">
                <h1 className="font-admin-sans text-admin-display-sm text-admin-primary">System Settings</h1>
                <p className="font-admin-sans text-admin-body-md text-admin-on-surface-variant mt-admin-sm">
                    Manage global platform configurations and preferences.
                </p>
            </div>

            <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-admin-lg shadow-sm hover:shadow-md transition-all duration-200 border-t-4 border-t-admin-secondary mb-admin-lg">
                <div className="flex items-center justify-between mb-admin-lg">
                    <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">General Settings</h3>
                    <span className="material-symbols-outlined text-admin-secondary">settings</span>
                </div>
                <p className="font-admin-sans text-admin-body-sm text-admin-on-surface-variant mb-admin-xl leading-relaxed max-w-3xl">
                    More settings will be added here.
                </p>
            </div>
        </div>
    );
}
