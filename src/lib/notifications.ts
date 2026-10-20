export type NotificationKind = 'attendance' | 'daily_log' | 'note' | 'activity' | 'message';
export interface NotificationTarget { event_type: string; child_id: string | null; thread_id: string | null; event_date: string | null }
export function notificationTarget(item: NotificationTarget) {
  if (item.event_type === 'message' && item.thread_id) return { to: '/messages/$id' as const, params: { id: item.thread_id } };
  if (item.event_type === 'activity') return { to: '/activities' as const };
  if (item.child_id) return { to: '/child' as const, search: { childId: item.child_id, ...(item.event_date ? { date: item.event_date } : {}) } };
  return { to: '/messages' as const };
}