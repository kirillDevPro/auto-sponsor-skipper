/**
 * background/constants.js — service-worker-side constants for the SponsorBlock
 * fetch proxy: API endpoint, hashing, timeouts, and the cache cap. The per-video
 * cache KEY and TTL policy live in shared/videoCache.js and the content/popup ↔
 * SW message protocol in shared/messaging.js (both shared with the popup).
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

/** Max number of cached videos kept before oldest-first pruning. */
export const CACHE_MAX_ENTRIES = 1000;
