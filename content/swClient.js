/**
 * content/swClient.js — messaging bridge to the stateless service worker.
 *
 * Wraps chrome.runtime.sendMessage with retry + backoff. A suspended MV3 worker
 * is woken by the message itself; if a wake genuinely fails (undefined response
 * or chrome.runtime.lastError) we retry a few times before giving up. An
 * orphaned content script short-circuits before messaging, because every
 * chrome.* call would throw after the extension context is invalidated.
 */

;(() => {
  const NS = self.__SBSKIP__;

  /** Per-attempt cap: if the SW accepts the message but never responds, don't hang. */
  const ATTEMPT_TIMEOUT_MS = 10000;

  /**
   * Send one runtime message attempt.
   * @param {object} msg - message payload sent to the service worker.
   * @returns {Promise<object>} service-worker response, or an {ok:false} error.
   * @sideEffects Sends a chrome.runtime message and starts a per-attempt timer.
   */
  function sendOnce(msg) {
    return new Promise((resolve) => {
      let settled = false;
      const done = (v) => { if (!settled) { settled = true; resolve(v); } };
      // Guard against a SW that holds the channel open but never calls
      // sendResponse (terminated mid-handling): resolve as a retryable error.
      const timer = setTimeout(() => done({ ok: false, error: "timeout" }), ATTEMPT_TIMEOUT_MS);
      try {
        chrome.runtime.sendMessage(msg, (resp) => {
          clearTimeout(timer);
          if (chrome.runtime.lastError) {
            done({ ok: false, error: chrome.runtime.lastError.message });
            return;
          }
          if (resp === undefined) {
            done({ ok: false, error: "no response" });
            return;
          }
          done(resp);
        });
      } catch (e) {
        clearTimeout(timer);
        done({ ok: false, error: String((e && e.message) || e) });
      }
    });
  }

  /**
   * Request segments for a video, retrying transport failures with backoff.
   * @param {string} videoId
   * @param {{attempts?: number}} [opts]
   * @returns {Promise<{ok:boolean, status?:string, segments?:object[], error?:string}>}
   */
  NS.getSegments = async function (videoId, { attempts = 4 } = {}) {
    // An orphaned content script (extension reloaded/updated) can't reach the SW;
    // skip the futile retries and let the caller treat it as a transient failure.
    if (!NS.contextAlive()) return { ok: false, error: "context invalidated", segments: [] };
    let delay = 300;
    for (let i = 0; i < attempts; i++) {
      const resp = await sendOnce({ type: NS.MSG.GET_SEGMENTS, videoId });
      if (resp && resp.ok) return resp;
      // A permanent rejection (bad input) is not worth retrying.
      if (resp && resp.ok === false && resp.error === "bad videoId") return resp;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 3000);
    }
    return { ok: false, error: "service worker unreachable", segments: [] };
  };
})();
