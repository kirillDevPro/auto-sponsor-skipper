/**
 * content/skipCounter.js - accumulates skipped-segment stats and flushes them to
 * chrome.storage.local in debounced batches, so a burst of skips doesn't hammer
 * storage. Stored under STATS_KEY as { count, seconds }. record() adds a skip;
 * unrecord() reverses one (an Undo from the skip notice).
 *
 * Flushes are serialized through a promise chain so an Undo's negative flush and
 * the original skip's positive flush can't interleave their read-modify-write and
 * resurrect a reversed skip; the stored totals are clamped at >= 0.
 *
 * Known v1 limitation: the read-modify-write is not atomic ACROSS tabs, so two
 * YouTube tabs skipping at the same instant can lose an increment. This affects
 * only the displayed statistic, never the skipping itself, so it is accepted for
 * the lite build rather than paying for a cross-context lock.
 */

;(() => {
  const NS = self.__SBSKIP__;

  let pendingCount = 0;
  let pendingSeconds = 0;
  let timer = null;
  // Serializes the read-modify-write flushes (same rationale as settingsStore's
  // updateSettings chain) so overlapping positive/negative flushes apply in order.
  let flushChain = Promise.resolve();

  /**
   * Persist one delta batch to local storage, clamped at >= 0. Runs on the
   * serialized flushChain, so an in-flight flush completes before the next starts.
   * @param {number} dCount - count delta (negative for an Undo).
   * @param {number} dSeconds - seconds delta (negative for an Undo).
   * @returns {Promise<void>}
   * @sideEffects Reads and writes chrome.storage.local skip statistics.
   */
  async function persist(dCount, dSeconds) {
    // This can run after the extension was reloaded/updated, orphaning this content
    // script; chrome.* then throws "Extension context invalidated". Stats are
    // cosmetic, so skip silently - check contextAlive first, and still catch the
    // check-to-call race.
    if (!NS.contextAlive()) return;
    try {
      const obj = await chrome.storage.local.get(NS.STORAGE.STATS_KEY);
      const cur = obj[NS.STORAGE.STATS_KEY] || { count: 0, seconds: 0 };
      cur.count = Math.max(0, cur.count + dCount);
      cur.seconds = Math.max(0, cur.seconds + dSeconds);
      await chrome.storage.local.set({ [NS.STORAGE.STATS_KEY]: cur });
    } catch (_e) {
      // Context invalidated mid-flush, or storage failed for cosmetic stats.
    }
  }

  /**
   * Flush the debounced batch onto the serialized write chain.
   * @returns {void}
   * @sideEffects Clears the pending batch and appends a storage write to flushChain.
   */
  function flush() {
    timer = null;
    const c = pendingCount;
    const s = pendingSeconds;
    pendingCount = 0;
    pendingSeconds = 0;
    if (!c && !s) return; // a record+undo pair nets zero — nothing to write
    flushChain = flushChain.then(() => persist(c, s));
  }

  /**
   * Append a delta to the in-memory batch and arm the debounce timer.
   * @param {number} dCount - count delta.
   * @param {number} dSeconds - seconds delta.
   * @returns {void}
   * @sideEffects Mutates the pending batch and may start the flush timer.
   */
  function enqueue(dCount, dSeconds) {
    pendingCount += dCount;
    pendingSeconds += dSeconds;
    if (!timer) timer = setTimeout(flush, 1500);
  }

  NS.skipCounter = {
    /**
     * Record one skipped segment of `seconds` length.
     * @param {number} seconds - skipped segment duration in seconds.
     * @returns {void}
     * @sideEffects Adds to the in-memory batch and may start the flush timer.
     */
    record(seconds) {
      enqueue(1, Math.max(0, seconds || 0));
    },

    /**
     * Reverse one previously-recorded skip (an Undo from the skip notice).
     * @param {number} seconds - the skipped segment duration to subtract.
     * @returns {void}
     * @sideEffects Adds a negative delta to the batch and may start the flush timer.
     */
    unrecord(seconds) {
      enqueue(-1, -Math.max(0, seconds || 0));
    }
  };
})();
