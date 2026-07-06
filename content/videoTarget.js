/**
 * content/videoTarget.js — locates the page's HTML5 <video> element, waiting
 * for it via a MutationObserver when it isn't present yet (it can lag behind an
 * SPA navigation, or be remounted between videos). Returns null after a timeout
 * rather than hanging forever.
 */

;(() => {
  const NS = self.__SBSKIP__;

  // Prefer the main player element; fall back to any <video> only if it isn't
  // present yet. A single grouped selector would return the first <video> in
  // document order, which can be an unrelated preview element.
  function findVideo() {
    return (
      document.querySelector("video.html5-main-video") ||
      document.querySelector("#movie_player video") ||
      document.querySelector("video")
    );
  }

  NS.videoTarget = {
    /**
     * @param {number} [timeoutMs]
     * @returns {Promise<HTMLVideoElement|null>}
     */
    waitFor(timeoutMs = 15000) {
      const existing = findVideo();
      if (existing) return Promise.resolve(existing);

      return new Promise((resolve) => {
        let settled = false;
        const finish = (el) => {
          if (settled) return;
          settled = true;
          obs.disconnect();
          clearTimeout(timer);
          resolve(el);
        };
        const obs = new MutationObserver(() => {
          const v = findVideo();
          if (v) finish(v);
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
        const timer = setTimeout(() => finish(findVideo()), timeoutMs);
      });
    }
  };
})();
