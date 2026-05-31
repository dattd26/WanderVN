import React from 'react';

export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden limestone-shadow p-5 space-y-4 animate-pulse">
      <div className="w-full aspect-[16/10] bg-surface-container rounded-lg" />
      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-surface-container rounded" />
        <div className="h-4 w-1/2 bg-surface-container rounded" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-7 w-20 bg-surface-container rounded-full" />
        <div className="h-7 w-24 bg-surface-container rounded-full" />
      </div>
      <div className="pt-4 border-t border-outline-variant/20 flex justify-between">
        <div className="h-5 w-1/3 bg-surface-container rounded" />
        <div className="h-8 w-24 bg-surface-container rounded" />
      </div>
    </div>
  );
};
