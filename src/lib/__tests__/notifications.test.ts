import { describe, it, expect } from 'vitest';
import { notificationTarget } from '../notifications';

describe('parent notification destinations', () => {
  const base = { child_id: ' child ', thread_id: null, event_date: '2026-10-20' };
  it('opens the message thread, not another inbox', () => expect(notificationTarget({ ...base, event_type: 'message', thread_id: 'thread-123' })).toEqual({ to: '/messages/$id', params: { id: 'thread-123' } }));
  it('opens daily follow-up for the notification child and date', () => expect(notificationTarget({ ...base, child_id: 'child-123', event_type: 'daily_log' })).toEqual({ to: '/child', search: { childId: 'child-123', date: '2026-10-20' } }));
  it('opens the existing activity page', () => expect(notificationTarget({ ...base, event_type: 'activity' })).toEqual({ to: '/activities' }));
});