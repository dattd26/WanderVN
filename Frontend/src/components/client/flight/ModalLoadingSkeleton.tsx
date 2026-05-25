import React from 'react';

interface ModalLoadingSkeletonProps {
  rows?: number;
}

export const ModalLoadingSkeleton: React.FC<ModalLoadingSkeletonProps> = ({ rows = 1 }) => {
  return (
    <div className="animate-pulse space-y-8 p-2" aria-label="Đang tải chi tiết chuyến bay...">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 rounded-md w-3/4 shimmer-bar" />
          <div className="h-3 bg-neutral-800 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 bg-neutral-800 rounded-full" />
      </div>

      {/* Timeline skeleton */}
      <div className="flex items-center justify-between gap-4 bg-neutral-800/50 p-5 rounded-xl">
        <div className="space-y-2">
          <div className="h-8 w-20 bg-neutral-700 rounded" />
          <div className="h-3 w-16 bg-neutral-800 rounded" />
          <div className="h-3 w-24 bg-neutral-800 rounded" />
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 px-4">
          <div className="h-3 w-20 bg-neutral-800 rounded" />
          <div className="h-px w-full bg-neutral-700 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 bg-neutral-700 rounded-full" />
            </div>
          </div>
          <div className="h-3 w-16 bg-neutral-800 rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-8 w-20 bg-neutral-700 rounded" />
          <div className="h-3 w-16 bg-neutral-800 rounded" />
          <div className="h-3 w-24 bg-neutral-800 rounded" />
        </div>
      </div>

      {/* Airline info skeleton */}
      <div className="flex items-center gap-4 p-4 bg-neutral-800/40 rounded-xl">
        <div className="w-14 h-14 bg-neutral-700 rounded-lg" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-neutral-700 rounded" />
          <div className="h-3 w-24 bg-neutral-800 rounded" />
          <div className="h-3 w-20 bg-neutral-800 rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 w-16 bg-neutral-700 rounded" />
          <div className="h-3 w-12 bg-neutral-800 rounded" />
        </div>
      </div>

      {/* Benefits skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-neutral-800/40 rounded-lg">
            <div className="w-8 h-8 bg-neutral-700 rounded-lg" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-16 bg-neutral-700 rounded" />
              <div className="h-3 w-24 bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pricing skeleton */}
      <div className="space-y-3 p-5 bg-neutral-800/40 rounded-xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-3 w-28 bg-neutral-800 rounded" />
            <div className="h-4 w-20 bg-neutral-700 rounded" />
          </div>
        ))}
        <div className="border-t border-neutral-700 pt-3 flex justify-between items-center">
          <div className="h-5 w-20 bg-neutral-700 rounded" />
          <div className="h-7 w-28 bg-yellow-500/20 rounded" />
        </div>
      </div>

      {Array.from({ length: rows - 1 }).map((_, i) => (
        <div key={i} className="h-12 bg-neutral-800/40 rounded-xl" />
      ))}
    </div>
  );
};

export default ModalLoadingSkeleton;
