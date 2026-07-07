/**
 * content/segmentFilter.js — the single source of truth for "which segments are
 * active" (i.e. would actually be skipped) given the raw API segments, the
 * user's settings, and whether the current channel is whitelisted.
 *
 * Both the skip engine (which seeks past these) and the timeline markers (which
 * draw these) call this ONE function, so the marker set is definitionally equal
 * to the skipped set — they can never drift apart.
 *
 * Pure and load-safe: no `document`, no `chrome`, no DOM. That keeps it
 * headlessly testable and lets it load before any other content module needs it.
 */

;(() => {
  const NS = self.__SBSKIP__;

  NS.segmentFilter = {
    /**
     * Filter raw segments down to the ones that should be acted on.
     * @param {Array<{start:number,end:number,category:string}>} raw
     * @param {{enabled:boolean, categories:Object<string,boolean>, minSegmentLength?:number}} settings
     * @param {boolean} whitelisted - true if the current channel is whitelisted.
     * @returns {Array<{start:number,end:number,category:string}>} active segments,
     *   in the SAME order as `raw` (the order the skip engine scans, so a
     *   tooltip that picks "the first covering segment" matches the seek).
     */
    filterActive(raw, settings, whitelisted) {
      if (whitelisted || !settings || !settings.enabled) return [];
      const minLen = settings.minSegmentLength || 0;
      const cats = settings.categories || {};
      return (raw || []).filter(
        (seg) => cats[seg.category] === true && seg.end - seg.start >= minLen
      );
    }
  };
})();
