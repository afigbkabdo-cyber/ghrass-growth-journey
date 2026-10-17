export function attendanceDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function attendanceTime(value: string | null, locale: string) {
  return value ? new Date(value).toLocaleTimeString(locale, { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' }) : null;
}
export function attendanceStatus(row?: { status?: string; check_in: string | null; check_out?: string | null } | null) {
  if (!row) return 'unrecorded';
  if (row.status === 'absent') return 'absent';
  return row.check_in ? (row.check_out ? 'completed' : 'present') : 'unrecorded';
}
export function attendanceCounts(rows: Array<{ status?: string; check_in: string | null }>) {
  return { present: rows.filter(r => Boolean(r.check_in)).length, absent: rows.filter(r => r.status === 'absent' && !r.check_in).length };
}
