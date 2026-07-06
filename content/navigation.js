/**
 * content/navigation.js — detects the current watch videoId and when it
 * changes. YouTube is a single-page app: navigating between videos updates the
 * URL via the History API and fires no fresh document load.
 *
 * Source of truth = the `v` query param of a /watch URL (a stable, documented
 * contract). YouTube's internal `yt-navigate-finish` event and `popstate` are
 * treated only as fast triggers to re-read that URL; a low-frequency poll is
 * the safety net if the undocumented event ever stops firing.
 */

;(() => {
  const NS = self.__SBSKIP__;

  /** @returns {string|null} the current watch videoId, or null off a watch page. */
  function parseVideoId() {
    if (location.pathname !== "/watch") return null;
    const v = new URLSearchParams(location.search).get("v");
    return v && v.length >= 6 ? v : null;
  }

  let currentId = null;
  let onVideo = null;

  function check() {
    const id = parseVideoId();
    if (id !== currentId) {
      currentId = id;
      // Fire on EVERY change, including id === null (left the watch page), so
      // the orchestrator can clear stale segments and cancel pending retries.
      if (typeof onVideo === "function") onVideo(id);
    }
  }

  NS.navigation = {
    /**
     * Begin watching for video changes.
     * @param {(videoId: string) => void} callback
     */
    start(callback) {
      onVideo = callback;
      document.addEventListener("yt-navigate-finish", check, true);
      window.addEventListener("popstate", check, true);
      setInterval(check, 1000); // safety net — source of truth is the URL
      check(); // initial page
    },
    currentVideoId() {
      return currentId;
    }
  };
})();
