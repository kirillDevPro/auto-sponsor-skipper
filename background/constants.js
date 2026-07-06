/**
 * background/constants.js — service-worker-side constants for the SponsorBlock
 * fetch proxy: API endpoint, hashing, and the local segment cache policy.
 */

/** Base URL of the SponsorBlock skip-segments endpoint. */
export const API_BASE = "https://sponsor.ajay.app/api/skipSegments";

/** Number of leading hex chars of SHA-256(videoID) sent as the privacy prefix. */
export const HASH_PREFIX_LEN = 4;

/** SponsorBlock `service` query value. */
export const SERVICE = "YouTube";

/** SponsorBlock `actionType` query value — this client only auto-skips. */
export const ACTION_TYPE = "skip";

/** Abort the API fetch after this many ms so a hung request can't wedge the pipeline. */
export const API_TIMEOUT_MS = 8000;

/** chrome.storage.local key prefix for one cache entry per video. */
export const CACHE_PREFIX = "sbseg_";

/** Max number of cached videos kept before oldest-first pruning. */
export const CACHE_MAX_ENTRIES = 1000;

/** Cache TTL per result status, in milliseconds. */
export const TTL_MS = {
  found: 7 * 24 * 60 * 60 * 1000, // 7 days — segments are stable
  empty: 12 * 60 * 60 * 1000,     // 12 hours — a video may gain its first segment
  error: 30 * 1000                // 30 seconds — short enough that a content-side
                                  // retry re-fetches, small enough to stay polite
};

/** Message protocol type used by the content script. */
export const MSG_GET_SEGMENTS = "GET_SEGMENTS";
