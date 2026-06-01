export function KpiSkeleton() {
  return (
    <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant border-t-4 border-t-admin-outline-variant animate-pulse">
      <div className="flex justify-between items-start mb-admin-sm">
        <div className="h-3 w-24 bg-admin-surface-container rounded" />
        <div className="h-6 w-6 bg-admin-surface-container rounded" />
      </div>
      <div className="flex items-baseline gap-admin-sm">
        <div className="h-8 w-32 bg-admin-surface-container rounded" />
        <div className="h-4 w-12 bg-admin-surface-container rounded" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="xl:col-span-2 bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant animate-pulse">
      <div className="h-5 w-40 bg-admin-surface-container rounded mb-2" />
      <div className="h-3 w-60 bg-admin-surface-container rounded mb-8" />
      <div className="h-[300px] w-full bg-admin-surface-container rounded" />
    </div>
  );
}

export function DoughnutSkeleton() {
  return (
    <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant animate-pulse flex flex-col items-center">
      <div className="h-5 w-40 bg-admin-surface-container rounded mb-2 self-start" />
      <div className="h-3 w-52 bg-admin-surface-container rounded mb-8 self-start" />
      <div className="w-48 h-48 rounded-full bg-admin-surface-container mb-6" />
      <div className="w-full space-y-3">
        <div className="h-4 w-full bg-admin-surface-container rounded" />
        <div className="h-4 w-full bg-admin-surface-container rounded" />
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <section className="xl:col-span-3 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant overflow-hidden animate-pulse">
      <div className="p-admin-lg border-b border-admin-outline-variant flex justify-between items-center">
        <div className="h-5 w-48 bg-admin-surface-container rounded" />
        <div className="h-4 w-28 bg-admin-surface-container rounded" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-admin-md flex items-center gap-admin-lg border-b border-admin-outline-variant last:border-0">
          <div className="w-10 h-10 rounded-full bg-admin-surface-container" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-admin-surface-container rounded" />
            <div className="h-3 w-1/2 bg-admin-surface-container rounded" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-3 w-16 bg-admin-surface-container rounded ml-auto" />
            <div className="h-3 w-12 bg-admin-surface-container rounded ml-auto" />
          </div>
        </div>
      ))}
    </section>
  );
}
