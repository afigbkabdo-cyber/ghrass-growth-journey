import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { recordedSummary, scopedKey, clearPrivateCache } from '../dashboard';
import { scopeCache } from '../private-cache';

describe('real dashboard records', () => {
  it('does not invent an attendance rate with no records', () => {
    expect(recordedSummary([], 4)).toEqual({ present: 0, absent: 0, unrecorded: 4, rate: null });
  });
  it('counts explicit absences and checkins only, not unrecorded children as absent', () => {
    expect(recordedSummary([{ status: 'present', check_in: null }, { status: 'absent', check_in: null }, { status: 'late', check_in: '2026-10-19T05:00:00Z' }], 4)).toEqual({ present: 1, absent: 1, unrecorded: 2, rate: 50 });
  });
  it('separates cache keys by user', () => {
    expect(scopedKey(['my-children'], 'parent-a')).not.toEqual(scopedKey(['my-children'], 'parent-b'));
  });
  it('separates daily data by date', () => {
    expect(scopedKey(['daily-log', 'child-a'], 'parent-a', '2026-10-19')).not.toEqual(scopedKey(['daily-log', 'child-a'], 'parent-a', '2026-10-20'));
  });
  it('scopes legacy keys too and preserves prefix invalidation', async () => {
    const cache = new QueryClient();
    scopeCache(cache, 'parent-a');
    cache.setQueryData(['my-children'], ['child-a']);
    scopeCache(cache, 'parent-b');
    expect(cache.getQueryData(['my-children'])).toBeUndefined();
    cache.setQueryData(['daily-log', 'child-b', '2026-10-19'], { mealStatus: 'all' });
    await cache.invalidateQueries({ queryKey: ['daily-log', 'child-b'] });
    expect(cache.getQueryState(['daily-log', 'child-b', '2026-10-19'])?.isInvalidated).toBe(true);
  });
  it('cancels requests before clearing previous user data', async () => {
    const actions: string[] = [];
    await clearPrivateCache({ cancelQueries: async () => { actions.push('cancel'); }, clear: () => { actions.push('clear'); } });
    expect(actions).toEqual(['cancel', 'clear']);
    const cache = new QueryClient();
    cache.setQueryData(['parent-threads'], [{ id: 'private-thread' }]);
    await clearPrivateCache(cache);
    expect(cache.getQueryData(['parent-threads'])).toBeUndefined();
    expect(cache.getQueryCache().getAll()).toHaveLength(0);
  });
});