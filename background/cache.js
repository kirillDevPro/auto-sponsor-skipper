/**
 * background/cache.js — per-video segment cache in chrome.storage.local.
 *
 * One key per video (CACHE_PREFIX + videoId) so a write never rewrites a giant
 * blob. TTL is evaluated at read time by status (found / empty / error). On
 * write, we prune each per-video key group (the segment cache AND the content
 * script's whitelist-decision records) oldest-first by fetchedAt when it exceeds
 * CACHE_MAX_ENTRIES — keeping storage well under the 10 MB local limit without
 * needing the `unlimitedStorage` permission. The service worker owns this one
 * best-effort prune pass; the content script writes sbwl_ but never prunes (it
 * would race across tabs), so the cap is EVENTUAL — enforced by a later successful
 * prune pass during a segment fetch. Both groups normally grow one-per-video; a
 * sustained SW-unreachable spell
 * can let sbwl_ run over the cap until the next successful fetch prunes it, but each
 * record is tiny (an id + a boolean + a timestamp), so it stays far under quota.
 * Both prefixes share one prune pass: a failure stops the rest of that pass, but
 * the pass is best-effort as a whole, so maintenance failure never turns a
 * successful segment write into a fetch error.
 */

import { CACHE_MAX_ENTRIES } from "./constants.js";
import { CACHE_PREFIX, WL_PREFIX, cacheKey, isFresh } from "../shared/videoCache.js";

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
  // Pruning is best-effort capacity maintenance: a storage hiccup while trimming
  // (either group) must NEVER turn a successful segment write into a failure that
  // segmentService would cache as "error", disabling skipping.
  try {
    await pruneIfNeeded();
  } catch (e) {
    console.debug("[AutoSponsorSkipper] cache prune error", e);
  }
  return entry;
}

/**
 * Prune both per-video key groups beyond CACHE_MAX_ENTRIES in one pass. The
 * caller makes the pass best-effort; there is no per-prefix failure isolation.
 * The common (under-cap) path lists only keys — via getKeys() when available —
 * so a write doesn't read every stored value on every fetch; values are read
 * only for a group we must prune.
 * @returns {Promise<void>}
 */
async function pruneIfNeeded() {
  const local = chrome.storage.local;
  const allKeys =
    typeof local.getKeys === "function"
      ? await local.getKeys()
      : Object.keys(await local.get(null));
  for (const prefix of [CACHE_PREFIX, WL_PREFIX]) {
    await prunePrefix(local, allKeys.filter((k) => k.startsWith(prefix)));
  }
}

/**
 * Oldest-first prune of one prefix group down to CACHE_MAX_ENTRIES. A missing
 * fetchedAt sorts as 0 (pruned first), so a malformed legacy record can't outlive
 * a valid newer one. Values are read only when the group is actually over cap.
 * @param {chrome.storage.StorageArea} local
 * @param {string[]} keys - the keys in this prefix group.
 * @returns {Promise<void>}
 */
async function prunePrefix(local, keys) {
  if (keys.length <= CACHE_MAX_ENTRIES) return;
  const all = await local.get(keys);
  const sorted = keys
    .map((k) => ({ k, at: (all[k] && all[k].fetchedAt) || 0 }))
    .sort((a, b) => a.at - b.at);
  const remove = sorted.slice(0, keys.length - CACHE_MAX_ENTRIES).map((x) => x.k);
  if (remove.length) await local.remove(remove);
}
