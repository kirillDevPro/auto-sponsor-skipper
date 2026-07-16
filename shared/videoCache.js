/**
 * shared/videoCache.js — single source of truth for the per-video keys the popup
 * reads from chrome.storage.local: the SponsorBlock segment cache (key + TTL) and
 * the whitelist-decision record.
 *
 * The service worker WRITES the segment cache (background/cache.js); the content
 * script WRITES the whitelist-decision record (content/content.js); the popup
 * READS both (popup/popup.js) for the current video's status line, so the key
 * formats must agree across all three. The classic content tree can't import this
 * module, so it duplicates the WL prefix in content/config.js NS.STORAGE.
 *
 * Pure: no chrome, no DOM — headlessly testable and safe to import anywhere.
 */

/** chrome.storage.local key prefix for one segment-cache entry per video. */
export const CACHE_PREFIX = "sbseg_";

/**
 * chrome.storage.local key prefix for one whitelist-decision record per video:
 * { videoId, whitelisted, fetchedAt }. Written by the content script (the enforcer),
 * read by the popup so its status line reports the SAME decision skipping used.
 * Disjoint from CACHE_PREFIX — the SW's setCached fully overwrites its own entry.
 */
export const WL_PREFIX = "sbwl_";

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
 * @param {string} videoId
 * @returns {string} the storage key for a video's recorded whitelist decision.
 */
export function wlKey(videoId) {
  return WL_PREFIX + videoId;
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
