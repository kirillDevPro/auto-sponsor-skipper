/**
 * shared/segmentFilter.js — the canonical "which segments are active" predicate
 * for the MODULE tree (currently consumed by the popup): given the raw API
 * segments, the user's settings, and whether the current channel is whitelisted,
 * return the segments that would actually be skipped.
 *
 * The classic content tree can't import ES modules, so content/segmentFilter.js
 * is a DELIBERATE duplicate of filterActive() — the copy the skip engine and the
 * timeline markers call. tests/segmentFilter.test.mjs pins the two copies to
 * identical active sets and ordering. The popup's honest
 * status line runs THIS copy, so what it reports is the same computation that
 * enforcement is pinned to — the two cannot silently disagree.
 *
 * Pure: no chrome, no DOM — headlessly testable and safe to import anywhere.
 */

/**
 * Filter raw segments down to the ones that should be acted on.
 * @param {Array<{start:number,end:number,category:string}>} raw
 * @param {{enabled:boolean, categories:Object<string,boolean>, minSegmentLength?:number}} settings
 * @param {boolean} whitelisted - true if the current channel is whitelisted.
 * @returns {Array<{start:number,end:number,category:string}>} active segments, in
 *   the SAME order as `raw`.
 */
export function filterActive(raw, settings, whitelisted) {
  if (whitelisted || !settings || !settings.enabled) return [];
  const minLen = settings.minSegmentLength || 0;
  const cats = settings.categories || {};
  return (raw || []).filter(
    (seg) => cats[seg.category] === true && seg.end - seg.start >= minLen
  );
}
