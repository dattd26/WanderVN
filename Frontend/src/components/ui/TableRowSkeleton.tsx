import React from 'react';

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-admin-lg py-admin-md">
        <div className="flex items-center gap-admin-md">
          <div className="w-8 h-8 rounded bg-admin-surface-container animate-pulse" />
          <div className="space-y-1">
            <div className="h-3 w-40 bg-admin-surface-container animate-pulse rounded" />
            <div className="h-2 w-24 bg-admin-surface-container animate-pulse rounded" />
          </div>
        </div>
      </td>
      <td className="px-admin-lg py-admin-md">
        <div className="h-3 w-20 bg-admin-surface-container animate-pulse rounded" />
      </td>
      <td className="px-admin-lg py-admin-md">
        <div className="h-3 w-20 bg-admin-surface-container animate-pulse rounded" />
      </td>
      <td className="px-admin-lg py-admin-md">
        <div className="h-3 w-24 bg-admin-surface-container animate-pulse rounded" />
      </td>
      <td className="px-admin-lg py-admin-md text-center">
        <div className="h-4 w-20 bg-admin-surface-container animate-pulse rounded mx-auto" />
      </td>
      <td className="px-admin-lg py-admin-md text-right">
        <div className="h-7 w-28 bg-admin-surface-container animate-pulse rounded ml-auto" />
      </td>
    </tr>
  );
};
