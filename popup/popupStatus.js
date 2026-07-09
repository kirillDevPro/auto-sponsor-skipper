/**
 * popup/popupStatus.js — pure helpers for the popup's per-video status line:
 * parse the watch videoId from the active tab's URL, and map a cached segment
 * entry to an i18n message key + count. No chrome, no DOM — headlessly testable.
 */

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
 * Map a cached segment entry to the popup status line's i18n key and optional
 * count. Mirrors the background/cache.js entry shape { status, segments }.
 * @param {{status?:string, segments?:object[]}|null|undefined} entry
 * @returns {{key:string, count:number|null}} the message key, plus a raw
 *   community segment count for the "marked" state (null in every other state).
 */
export function statusView(entry) {
  if (!entry) return { key: "popup_status_checking", count: null };
  if (entry.status === "found") {
    const count = Array.isArray(entry.segments) ? entry.segments.length : 0;
    if (count > 0) return { key: "popup_status_marked", count };
    return { key: "popup_status_none", count: null }; // defensive: found ⇒ ≥1
  }
  if (entry.status === "empty") return { key: "popup_status_none", count: null };
  return { key: "popup_status_error", count: null }; // "error" and any unknown status
}
