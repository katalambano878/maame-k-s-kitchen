/**
 * Simple client-side data cache to avoid re-fetching from Supabase
 * on every page navigation. Data is cached in memory for a configurable TTL.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes — reduce re-fetches during browsing

/**
 * Get data from cache or fetch it fresh.
 * Only caches successful (non-null) results so a temporary query failure
 * doesn't lock out the page for the full TTL.
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL
): Promise<T> {
  const cached = cache.get(key);

  if (cached && (Date.now() - cached.timestamp) < ttlMs) {
    return cached.data;
  }

  const data = await queryFn();

  // Don't cache null, undefined, or results that look like Supabase errors
  const isUsable = data !== null && data !== undefined &&
    !(typeof data === 'object' && 'error' in (data as any) && (data as any).error !== null && (data as any).data === null);

  if (isUsable) {
    cache.set(key, { data, timestamp: Date.now() });
  }

  return data;
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCache(key: string) {
  cache.delete(key);
}

/**
 * Invalidate all cache keys matching a prefix
 */
export function invalidateCachePrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear the entire cache
 */
export function clearCache() {
  cache.clear();
}