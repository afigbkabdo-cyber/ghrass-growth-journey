import { hashKey, type QueryClient } from '@tanstack/react-query';
import { scopedKey, clearPrivateCache } from './dashboard';

// Registered only in a browser effect; never shared between server requests.
const browserCaches = new Set<QueryClient>();
export function registerPrivateCache(cache: QueryClient) {
  browserCaches.add(cache);
  return () => { browserCaches.delete(cache); };
}
export async function clearRegisteredCaches() {
  await Promise.all([...browserCaches].map(clearPrivateCache));
}
export function scopeCache(cache: QueryClient, userId: string | null) {
  const defaults = cache.getDefaultOptions();
  cache.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, queryKeyHashFn: key => hashKey(scopedKey(key, userId)) } });
}