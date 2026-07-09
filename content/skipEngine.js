/**
 * content/skipEngine.js — the heart of the extension. Binds a `timeupdate`
 * listener to the <video> and seeks past any enabled skip segment.
 *
 * Design notes:
 * - One listener per video element (WeakSet guard) so it never double-binds or
 *   leaks; the active segment list is module state swapped per video, so a
 *   reused YouTube <video> element keeps working across SPA navigations.
 * - Never skips while an ad is playing (ad currentTime is unrelated).
 * - A per-segment "already skipped" set prevents oscillation and lets a user
 *   who manually scrubs back into a segment actually watch it.
 * - After performing one seek we stop scanning and re-evaluate on the next
 *   timeupdate from the new position, so overlapping segments can't seek
 *   backward using a now-stale currentTime.
 * - The seek target is clamped just below the video duration, so a sponsor that
 *   runs to the very end is still skipped (the video then ends naturally).
 * - After a skip, the optional skip notice is shown with an Undo callback owned
 *   by this module: it seeks back, keeps the segment marked, and reverses stats.
 */

;(() => {
  const NS = self.__SBSKIP__;
  const EPS = 0.15; // seconds of tolerance around a boundary

  const boundVideos = new WeakSet();
  let activeSegments = [];
  let recentlySkipped = new Set();
  let currentRaw = [];
  let currentWhitelisted = false;

  /**
   * True while YouTube is showing an ad (its player marks itself).
   * @returns {boolean} true when an ad marker is present in the player DOM.
   * @sideEffects None.
   */
  function adPlaying() {
    return !!document.querySelector(
      ".ad-showing, .ytp-ad-player-overlay, .html5-video-player.ad-showing"
    );
  }

  /**
   * The active (to-skip) segments for the current video + settings + whitelist.
   * Uses the shared filter so this list always equals the drawn marker set.
   * @returns {object[]} normalized {start,end,category} segments to skip.
   * @sideEffects None.
   */
  function computeActive() {
    return NS.segmentFilter.filterActive(currentRaw, NS.settings.get(), currentWhitelisted);
  }

  /**
   * Seek past the first matching active segment for the timeupdate's video.
   * @param {Event} e - video timeupdate event.
   * @returns {void}
   * @sideEffects Seeks the video, records stats, and may show an Undo notice.
   */
  function onTimeUpdate(e) {
    const video = e.target;
    if (adPlaying() || activeSegments.length === 0) return;
    const t = video.currentTime;
    const dur = Number.isFinite(video.duration) ? video.duration : Infinity;

    for (const seg of activeSegments) {
      if (t >= seg.start - EPS && t < seg.end - EPS) {
        const key = seg.start + "-" + seg.end;
        if (recentlySkipped.has(key)) continue;
        const target = Math.min(seg.end, dur - 0.05);
        if (target > t) {
          const len = seg.end - seg.start;
          video.currentTime = target;
          recentlySkipped.add(key);
          NS.skipCounter.record(len);
          NS.log("skipped", seg.category, seg.start.toFixed(1), "->", seg.end.toFixed(1));
          if (NS.settings.get().showSkipNotice) {
            // The engine OWNS the undo action (skipNotice is view-only): re-mark the
            // segment so seeking back can't immediately re-skip — recentlySkipped may
            // have been reset by an apply()/reapply() while the notice was still up —
            // seek to the segment start, and reverse the cosmetic stat. Guard a
            // <video> YouTube may have detached/replaced before the click. key/seg/len
            // are per-iteration bindings, so the closure captures this skip's values.
            NS.skipNotice.show({
              category: seg.category,
              onUndo() {
                if (!video || !video.isConnected) return;
                recentlySkipped.add(key);
                video.currentTime = seg.start;
                NS.skipCounter.unrecord(len);
              }
            });
          }
          break; // re-evaluate from the new position on the next timeupdate
        }
      }
    }
  }

  NS.skipEngine = {
    /**
     * Apply a video's segments and (re)bind the skip listener.
     * @param {HTMLVideoElement|null} video
     * @param {object[]} rawSegments - normalized {start,end,category}[]
     * @param {{whitelisted?: boolean}} [opts]
     * @returns {void}
     * @sideEffects Resets active skip state and may bind a video timeupdate listener.
     */
    apply(video, rawSegments, opts = {}) {
      currentRaw = rawSegments || [];
      currentWhitelisted = !!opts.whitelisted;
      recentlySkipped = new Set();
      activeSegments = computeActive();
      if (video && !boundVideos.has(video)) {
        boundVideos.add(video);
        video.addEventListener("timeupdate", onTimeUpdate);
      }
    },

    /**
     * Recompute the active list after a live content-relevant settings change.
     * @returns {void}
     * @sideEffects Resets the per-segment skip cooldown.
     */
    reapply() {
      recentlySkipped = new Set();
      activeSegments = computeActive();
    },

    /**
     * Drop all segments (e.g. when the tab leaves a watch page).
     * @returns {void}
     * @sideEffects Resets active skip state.
     */
    clear() {
      currentRaw = [];
      currentWhitelisted = false;
      recentlySkipped = new Set();
      activeSegments = [];
    }
  };
})();
