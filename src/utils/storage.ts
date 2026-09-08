export function formatDateKey(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const todayKey = formatDateKey(new Date());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  if (dateKey === todayKey) return 'Today, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (dateKey === yesterdayKey) return 'Yesterday, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (dateKey === tomorrowKey) return 'Tomorrow, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
