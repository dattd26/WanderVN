import React from 'react';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/50 dark:bg-slate-700/50 ${className || ''}`}
      {...props}
    />
  );
}
