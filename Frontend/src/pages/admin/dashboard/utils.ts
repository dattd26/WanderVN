export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.?0+$/, '') + 'K';
  return value.toLocaleString('vi-VN');
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatRelativeTime(isoTime: string): { time: string; date: string } {
  const d = new Date(isoTime);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (diffDays === 0) return { time: timeStr, date: 'HÔM NAY' };
  if (diffDays === 1) return { time: timeStr, date: 'HÔM QUA' };
  if (diffDays < 7) return { time: timeStr, date: `${diffDays} NGÀY TRƯỚC` };
  return { time: timeStr, date: d.toLocaleDateString('vi-VN') };
}

export function getActivityStyle(type: string) {
  switch (type) {
    case 'partner':
      return { icon: 'person_add', bgIconClass: 'bg-admin-secondary-container/10', textIconClass: 'text-admin-secondary' };
    case 'booking':
      return { icon: 'confirmation_number', bgIconClass: 'bg-admin-tertiary-container/10', textIconClass: 'text-admin-on-tertiary-container' };
    case 'payout':
      return { icon: 'payments', bgIconClass: 'bg-admin-on-secondary-container/10', textIconClass: 'text-admin-on-secondary-container' };
    default:
      return { icon: 'info', bgIconClass: 'bg-admin-secondary-container/10', textIconClass: 'text-admin-secondary' };
  }
}
