/**
 * content/skipCounter.js - accumulates skipped-segment stats and flushes them
 * to chrome.storage.local in debounced batches, so a burst of skips doesn't
 * hammer storage. Stored under STATS_KEY as { count, seconds }.
 *
 * Known v1 limitation: the read-modify-write is not atomic across tabs, so two
 * YouTube tabs skipping at the same instant can lose an increment. This affects
 * only the displayed statistic, never the skipping itself, so it is accepted
 * for the lite build rather than paying for a cross-context lock.
 */

;(() => {
  const NS = self.__SBSKIP__;

  let pendingCount = 0;
  let pendingSeconds = 0;
  let timer = null;

  /**
   * Flush the debounced stats batch to local storage when the extension context
   * is still alive; drop cosmetic stats if the context dies before or during the
   * write.
   * @returns {Promise<void>}
   * @sideEffects Reads and writes chrome.storage.local skip statistics.
   */
  async function flush() {
    timer = null;
    const c = pendingCount;
    const s = pendingSeconds;
    pendingCount = 0;
    pendingSeconds = 0;
    if (!c) return;
    // This debounced write can fire after the extension was reloaded/updated,
    // orphaning this content script; chrome.* then throws "Extension context
    // invalidated". Stats are cosmetic, so skip silently - check contextAlive
    // first, and still catch the check-to-call race.
    if (!NS.contextAlive()) return;
    try {
      const obj = await chrome.storage.local.get(NS.STORAGE.STATS_KEY);
      const cur = obj[NS.STORAGE.STATS_KEY] || { count: 0, seconds: 0 };
      cur.count += c;
      cur.seconds += s;
      await chrome.storage.local.set({ [NS.STORAGE.STATS_KEY]: cur });
    } catch (_e) {
      // Context invalidated mid-flush, or storage failed for cosmetic stats.
    }
  }

  NS.skipCounter = {
    /**
     * Record one skipped segment of `seconds` length.
     * @param {number} seconds - skipped segment duration in seconds.
     * @returns {void}
     * @sideEffects Adds to the in-memory batch and may start the flush timer.
     */
    record(seconds) {
      pendingCount += 1;
      pendingSeconds += Math.max(0, seconds || 0);
      if (!timer) timer = setTimeout(flush, 1500);
    }
  };
})();
