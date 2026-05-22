interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[32px] border border-outline-variant/15 bg-surface p-8 shadow-2xl shadow-black/5">
          <div className="flex flex-col gap-6">
            <div className="h-10 w-2/5 rounded-full bg-outline-variant/30" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-24 rounded-3xl bg-outline-variant/30" />
              <div className="h-24 rounded-3xl bg-outline-variant/30" />
              <div className="h-24 rounded-3xl bg-outline-variant/30" />
            </div>
            <div className="h-60 rounded-[28px] bg-outline-variant/30" />
          </div>
        </div>
      ))}
    </div>
  );
};
