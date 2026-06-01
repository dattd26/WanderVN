export function GrowthBadge({ percent }: { percent: number }) {
  if (percent === 0) {
    return <span className="text-admin-on-surface-variant text-sm font-medium">Ổn định</span>;
  }
  const isPositive = percent > 0;
  return (
    <span className={`${isPositive ? 'text-admin-secondary' : 'text-error'} text-sm font-bold flex items-center`}>
      <span className="material-symbols-outlined text-sm mr-0.5">
        {isPositive ? 'arrow_upward' : 'arrow_downward'}
      </span>
      {Math.abs(percent)}%
    </span>
  );
}
