/**
 * popup/popupStatus.js — pure helpers for the popup's per-video status line:
 * parse the watch videoId from the active tab's URL, and decide what the line
 * should say — what WILL be skipped, or the single most useful reason nothing
 * will. No chrome, no DOM — headlessly testable.
 *
 * The eight possible status outcomes are selected by a fixed precedence. Reasons
 * derived from segment contents run the SAME active-segment filter enforcement
 * uses (shared/segmentFilter.js filterActive), as a black box, with progressively
 * relaxed inputs — so this file holds only reason PRECEDENCE (UX policy), never a
 * second copy of the skip predicate.
 */

import { filterActive } from "../shared/segmentFilter.js";

/**
 * Extract the YouTube watch videoId from a tab URL, or null when the URL is not
 * a www.youtube.com /watch page (Shorts, home, music./m. subdomains, other
 * sites, and blank/invalid URLs all return null).
 * @param {string|undefined|null} url - the active tab's URL.
 * @returns {string|null} the videoId, or null when it is not a watch page.
 */
export function watchVideoIdFromUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.hostname !== "www.youtube.com" || u.pathname !== "/watch") return null;
  const v = u.searchParams.get("v");
  return v && v.length >= 6 ? v : null;
}

/**
 * Decide the popup status line's i18n key (+ optional count) for the active video:
 * what WILL be skipped, or the single most useful reason nothing will. Reasons are
 * ranked by precedence — broadest override first, and answers that don't need the
 * segment data come before those that do.
 *
 * `whitelisted` is TRI-STATE and load-bearing: `true`/`false` are the enforced
 * decision the content script recorded for THIS video; `null`/`undefined` means it
 * hasn't recorded one yet (fresh navigation, or an orphaned tab after an update) —
 * in which case we can't tell the real reason and say "checking" rather than guess.
 *
 * @param {{status?:string, segments?:object[]}|null|undefined} entry - the cached
 *   segment entry (background/cache.js shape { status, segments }).
 * @param {{enabled?:boolean, categories?:object, minSegmentLength?:number}|null} settings
 * @param {boolean|null|undefined} whitelisted - the recorded whitelist decision, or
 *   null/undefined when it is not yet known.
 * @returns {{key:string, count:number|null}} message key + a count (only for the
 *   "will skip" state; null otherwise).
 */
export function statusView(entry, settings, whitelisted) {
  // 1. Master off — the global kill switch overrides everything, no data needed.
  if (settings && settings.enabled === false) return { key: "popup_status_off", count: null };
  // 2. Whitelisted — a per-channel override, knowable without the segment fetch.
  if (whitelisted === true) return { key: "popup_status_whitelisted", count: null };
  // 3. Checking — don't guess without both the channel decision and segment data.
  if (whitelisted !== false) return { key: "popup_status_checking", count: null };
  if (!entry) return { key: "popup_status_checking", count: null };
  // 4. Error — reject load failures, unknown statuses, and corrupt found entries.
  if (entry.status !== "found" && entry.status !== "empty") return { key: "popup_status_error", count: null };
  // A "found" entry must carry an array; report corrupt data as an error rather
  // than a benign "none" that would hide it.
  if (entry.status === "found" && !Array.isArray(entry.segments)) return { key: "popup_status_error", count: null };
  // 5. None — no segments exist for this video.
  const raw = Array.isArray(entry.segments) ? entry.segments : [];
  if (entry.status === "empty" || raw.length === 0) return { key: "popup_status_none", count: null };
  // 6. Will skip — something passes the real enforcement filter.
  const active = filterActive(raw, settings, false);
  if (active.length > 0) return { key: "popup_status_will_skip", count: active.length };
  // 7/8. Too short vs category off — relax only the minimum-length filter. If an
  // enabled segment then appears it was too short; otherwise no raw segment's
  // category is enabled.
  const relaxed = filterActive(raw, { ...settings, minSegmentLength: 0 }, false);
  if (relaxed.length > 0) return { key: "popup_status_too_short", count: null };
  return { key: "popup_status_category_off", count: null };
}
