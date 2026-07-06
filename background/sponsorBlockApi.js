/**
 * background/sponsorBlockApi.js — builds and performs the SponsorBlock GET
 * request against the privacy hash-prefix endpoint, then normalizes the
 * response down to the minimal { start, end, category } segment shape.
 *
 * The query-array parameters (categories) MUST be URL-encoded; raw brackets and
 * quotes break the request. URLSearchParams handles the encoding for us.
 * The endpoint returns an array of videos sharing the hash prefix, so we filter
 * to the exact videoID. The per-video object exposes { videoID, segments } —
 * the `hash` field is not guaranteed present, so we key only on videoID.
 */

import {
  API_BASE,
  SERVICE,
  ACTION_TYPE,
  HASH_PREFIX_LEN,
  API_TIMEOUT_MS
} from "./constants.js";
import { CATEGORY_IDS } from "../shared/categories.js";
import { sha256HexPrefix } from "./hash.js";

/**
 * @typedef {{ start: number, end: number, category: string }} Segment
 * @typedef {{ status: "found"|"empty", segments: Segment[] }} SegmentResult
 */

/**
 * Fetch skip segments for one video from SponsorBlock.
 * @param {string} videoId - the 11-char YouTube videoID.
 * @param {typeof fetch} [fetchImpl] - injectable fetch (for headless tests).
 * @returns {Promise<SegmentResult>} normalized result; "empty" for 404 / no match.
 * @throws on network failure or non-404 HTTP error (caller caches "error").
 */
export async function fetchSegments(videoId, fetchImpl = fetch) {
  const prefix = await sha256HexPrefix(videoId, HASH_PREFIX_LEN);

  const params = new URLSearchParams();
  params.set("service", SERVICE);
  params.set("categories", JSON.stringify(CATEGORY_IDS));
  params.set("actionType", ACTION_TYPE);

  const url = `${API_BASE}/${prefix}?${params.toString()}`;

  // Bound the request: a hung TCP connection must not leave the message channel
  // (and the content script's retry loop) waiting forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  let res;
  try {
    res = await fetchImpl(url, { method: "GET", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  // 404 = nothing under this prefix; a legitimate "no segments" result.
  if (res.status === 404) return { status: "empty", segments: [] };
  if (!res.ok) throw new Error(`SponsorBlock HTTP ${res.status}`);

  const arr = await res.json();
  const mine = Array.isArray(arr)
    ? arr.find((v) => v && v.videoID === videoId)
    : null;

  if (!mine || !Array.isArray(mine.segments) || mine.segments.length === 0) {
    return { status: "empty", segments: [] };
  }

  const segments = mine.segments
    .filter((s) => Array.isArray(s.segment) && s.segment.length === 2)
    .map((s) => ({ start: s.segment[0], end: s.segment[1], category: s.category }))
    .sort((a, b) => a.start - b.start);

  return segments.length
    ? { status: "found", segments }
    : { status: "empty", segments: [] };
}
