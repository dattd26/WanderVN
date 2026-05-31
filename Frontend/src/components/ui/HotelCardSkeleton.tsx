import React from 'react';

export const HotelCardSkeleton: React.FC = () => {
  return (
    <div className="escape-card animate-pulse flex flex-row w-[380px] md:w-[420px] h-[180px] overflow-hidden border border-slate-200/50 bg-slate-100/50 dark:bg-slate-800/50 flex-shrink-0">
      <div className="w-32 md:w-40 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      </div>
    </div>
  );
};
