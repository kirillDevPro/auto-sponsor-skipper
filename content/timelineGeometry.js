/**
 * content/timelineGeometry.js — pure geometry/format helpers for the timeline
 * markers: converting a video time to a percent of the progress bar, the
 * inverse, and formatting a segment length for the hover tooltip.
 *
 * Pure and load-safe (no DOM / chrome), so the marker positioning math is
 * unit-testable without a browser.
 */

;(() => {
  const NS = self.__SBSKIP__;

  /** True only for a real, finite, positive duration (VOD). Live/DVR streams
   *  report Infinity and media that hasn't loaded reports NaN/0 — all "unknown". */
  function usable(dur) {
    return typeof dur === "number" && Number.isFinite(dur) && dur > 0;
  }

  NS.timelineGeometry = {
    /**
     * @param {number} t - a time in seconds.
     * @param {number} dur - the video duration in seconds.
     * @returns {number|null} `t` as a 0..100 percent of `dur` (clamped), or null
     *   when the duration is not yet usable (NaN / 0 / Infinity).
     */
    timeToPercent(t, dur) {
      if (!usable(dur)) return null;
      return Math.min(100, Math.max(0, (t / dur) * 100));
    },

    /**
     * @param {number} pct - a 0..100 percent along the progress bar.
     * @param {number} dur - the video duration in seconds.
     * @returns {number|null} the corresponding time in seconds, or null when the
     *   duration is not yet usable.
     */
    percentToTime(pct, dur) {
      if (!usable(dur)) return null;
      return (Math.min(100, Math.max(0, pct)) / 100) * dur;
    },

    /**
     * Format a segment length for the tooltip: "M:SS", or "H:MM:SS" past an hour.
     * @param {number} seconds
     * @returns {string}
     */
    formatLength(seconds) {
      const total = Math.max(0, Math.round(seconds || 0));
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const pad = (n) => String(n).padStart(2, "0");
      return h > 0 ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s);
    }
  };
})();
