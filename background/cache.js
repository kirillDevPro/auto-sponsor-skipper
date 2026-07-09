/**
 * background/cache.js — per-video segment cache in chrome.storage.local.
 *
 * One key per video (CACHE_PREFIX + videoId) so a write never rewrites a giant
 * blob. TTL is evaluated at read time by status (found / empty / error). On
 * write, if the cache exceeds CACHE_MAX_ENTRIES we prune oldest-first by
 * fetchedAt — keeping storage well under the 10 MB local limit without needing
 * the `unlimitedStorage` permission.
 */

import { CACHE_MAX_ENTRIES } from "./constants.js";
import { CACHE_PREFIX, cacheKey, isFresh } from "../shared/videoCache.js";

/**
 * @typedef {{ videoId: string, fetchedAt: number,
 *   status: "found"|"empty"|"error", segments: object[] }} CacheEntry
 */

/**
 * Read a fresh (non-expired) cache entry, or null if missing/stale.
 * @param {string} videoId
 * @param {number} now - current epoch ms (injected for testability).
 * @returns {Promise<CacheEntry|null>}
 */
export async function getCached(videoId, now) {
  const k = cacheKey(videoId);
  const obj = await chrome.storage.local.get(k);
  return isFresh(obj[k], now) ? obj[k] : null; // stale/missing → treat as miss
}

/**
 * Write a cache entry and prune if over capacity.
 * @param {string} videoId
 * @param {"found"|"empty"|"error"} status
 * @param {object[]} segments
 * @param {number} now - current epoch ms.
 * @returns {Promise<CacheEntry>}
 */
export async function setCached(videoId, status, segments, now) {
  const entry = { videoId, fetchedAt: now, status, segments: segments || [] };
  await chrome.storage.local.set({ [cacheKey(videoId)]: entry });
  await pruneIfNeeded();
  return entry;
}

/**
 * Oldest-first prune of cache entries beyond CACHE_MAX_ENTRIES. The common
 * (under-cap) path lists only keys — via getKeys() when available — so a write
 * doesn't read every cached value on every fetch; values are read only when we
 * actually need to sort by age to prune.
 */
async function pruneIfNeeded() {
  const local = chrome.storage.local;
  let keys;
  if (typeof local.getKeys === "function") {
    keys = (await local.getKeys()).filter((k) => k.startsWith(CACHE_PREFIX));
  } else {
    keys = Object.keys(await local.get(null)).filter((k) => k.startsWith(CACHE_PREFIX));
  }
  if (keys.length <= CACHE_MAX_ENTRIES) return;

  const all = await local.get(keys); // only cache entries, only when over cap
  const sorted = keys
    .map((k) => ({ k, at: (all[k] && all[k].fetchedAt) || 0 }))
    .sort((a, b) => a.at - b.at);
  const remove = sorted.slice(0, keys.length - CACHE_MAX_ENTRIES).map((x) => x.k);
  if (remove.length) await local.remove(remove);
}
