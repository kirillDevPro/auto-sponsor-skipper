/**
 * background/segmentService.js — orchestrates the cache-then-fetch flow for one
 * video: return a fresh cache hit, else fetch, cache, and return.
 *
 * A fetch failure is cached as a short-lived "error" (TTL_MS.error) so we back
 * off briefly, and returned as { status:"error" } so the content script can
 * schedule its own retry once that TTL lapses — a transient blip therefore
 * self-heals without the user having to navigate or reload.
 *
 * `inFlight` coalesces concurrent requests for the same videoId (e.g. two tabs
 * on the same video) into a single outbound fetch. It is a pure optimization,
 * NOT durable state: if the worker is suspended mid-flight the map is lost and
 * the next request simply refetches, so the worker stays effectively stateless.
 */

import { getCached, setCached } from "./cache.js";
import { fetchSegments } from "./sponsorBlockApi.js";

/** videoId -> in-flight Promise, deduplicating concurrent fetches. */
const inFlight = new Map();

/**
 * @param {string} videoId
 * @returns {Promise<{ status: "found"|"empty"|"error", segments: object[] }>}
 */
export async function getSegments(videoId) {
  const now = Date.now();

  const cached = await getCached(videoId, now);
  if (cached) return { status: cached.status, segments: cached.segments };

  if (inFlight.has(videoId)) return inFlight.get(videoId);

  const promise = (async () => {
    try {
      const { status, segments } = await fetchSegments(videoId);
      await setCached(videoId, status, segments, now);
      return { status, segments };
    } catch (_err) {
      await setCached(videoId, "error", [], now);
      return { status: "error", segments: [] };
    } finally {
      inFlight.delete(videoId);
    }
  })();

  inFlight.set(videoId, promise);
  return promise;
}
