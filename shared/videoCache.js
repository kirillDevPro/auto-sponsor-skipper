/**
 * shared/videoCache.js — single source of truth for the per-video SponsorBlock
 * segment cache key and its time-to-live policy.
 *
 * The service worker WRITES these cache entries (background/cache.js) and the
 * popup READS them (popup/popup.js) to show the current video's status, so the
 * key format and TTL must agree across both. Both are ES-module trees that may
 * import shared/, so this is their one shared definition — no duplication.
 *
 * Pure: no chrome, no DOM — headlessly testable and safe to import anywhere.
 */

/** chrome.storage.local key prefix for one cache entry per video. */
export const CACHE_PREFIX = "sbseg_";

/** Cache TTL per result status, in milliseconds. */
export const TTL_MS = {
  found: 7 * 24 * 60 * 60 * 1000, // 7 days — found segments are stable
  empty: 90 * 1000,               // 90 s — a freshly published video caches
                                  // "empty"; a reload/renavigation re-checks soon
                                  // after, so a segment submitted minutes later is
                                  // picked up quickly. Re-fetch is gated by
                                  // navigation, not a timer, so this stays polite.
  error: 30 * 1000                // 30 s — short enough that a content-side retry
                                  // re-fetches, small enough to stay polite.
};

/**
 * @param {string} videoId
 * @returns {string} the chrome.storage.local key for a video's cache entry.
 */
export function cacheKey(videoId) {
  return CACHE_PREFIX + videoId;
}

/**
 * Whether a cache entry is still within its status-based TTL at `now`.
 * @param {{fetchedAt:number, status:string}|null|undefined} entry
 * @param {number} now - current epoch ms.
 * @returns {boolean} true if `entry` exists and has not expired.
 */
export function isFresh(entry, now) {
  if (!entry) return false;
  const ttl = TTL_MS[entry.status] ?? TTL_MS.error;
  return now - entry.fetchedAt <= ttl;
}
