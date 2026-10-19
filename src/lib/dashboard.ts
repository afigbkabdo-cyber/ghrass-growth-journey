export function recordedSummary(rows: { status?: string; check_in: string | null }[], total: number) {
  const present = rows.filter(r => Boolean(r.check_in)).length;
  const absent = rows.filter(r => r.status === 'absent' && !r.check_in).length;
  return { present, absent, unrecorded: Math.max(0, total - present - absent), rate: present + absent ? Math.round(present / (present + absent) * 100) : null };
}

export function scopedKey(key: readonly unknown[], userId: string | null, date?: string) {
  return [...key, { userId, ...(date ? { date } : {}) }];
}

export async function clearPrivateCache(cache: { cancelQueries: () => Promise<unknown>; clear: () => void }) {
  await cache.cancelQueries();
  cache.clear();
}