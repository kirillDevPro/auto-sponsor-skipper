/**
 * content/channel.js — reads the current watch page's channel id/handle from
 * the YouTube DOM, for the per-channel whitelist. This is the ONE piece of
 * fragile DOM scraping in the extension, so it fails OPEN: if the channel can't
 * be read it returns null, meaning "not whitelisted," and skipping proceeds as
 * normal. A wrong read never breaks the core feature.
 */

;(() => {
  const NS = self.__SBSKIP__;

  NS.channel = {
    /**
     * @returns {string|null} a stable channel identifier ("@handle",
     *   "channel/UC...", "c/name", "user/name"), or null if not found.
     */
    current() {
      const selectors = [
        "ytd-video-owner-renderer a.yt-simple-endpoint",
        "#owner #channel-name a",
        "a.ytd-channel-name",
        "#upload-info a"
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.href) {
          const m = el.href.match(/\/(@[^/?#]+|channel\/[^/?#]+|c\/[^/?#]+|user\/[^/?#]+)/);
          if (m) return m[1];
        }
      }
      return null; // fail open
    }
  };
})();
