/**
 * content/config.js — first content script loaded. Bootstraps the shared
 * isolated-world namespace `self.__SBSKIP__` that every other content module
 * attaches to, and holds the content-side constants.
 *
 * Content scripts are CLASSIC scripts (a manifest content_scripts entry cannot
 * be an ES module), and all scripts in one entry share a single isolated-world
 * global scope. Each module is wrapped in an IIFE so its locals don't collide,
 * and attaches its public surface to __SBSKIP__.
 *
 * DEFAULTS and CATEGORY_COLORS below deliberately duplicate shared/categories.js;
 * STORAGE.WL_PREFIX duplicates shared/videoCache.js. The module tree can't be
 * imported here, so keep all three definitions in sync with their shared twins.
 */

;(() => {
  const NS = (self.__SBSKIP__ = self.__SBSKIP__ || {});

  NS.MSG = { GET_SEGMENTS: "GET_SEGMENTS" };

  NS.STORAGE = {
    SETTINGS_KEY: "settings",         // chrome.storage.sync
    STATS_KEY: "skipStats",           // chrome.storage.local
    WHITELIST_KEY: "channelWhitelist", // chrome.storage.local
    // Browser-locale language hint recorded at install by the service worker.
    // Applies only until the user picks a language. Duplicate of
    // shared/categories.js LANG_HINT_KEY (the classic tree can't import it).
    LANG_HINT_KEY: "languageHint",     // chrome.storage.local
    // Per-video whitelist-decision record { videoId, whitelisted, fetchedAt } the
    // popup reads for its status line. Duplicate of shared/videoCache.js WL_PREFIX
    // (the classic tree can't import it) — keep in sync.
    WL_PREFIX: "sbwl_"                // chrome.storage.local, key = WL_PREFIX + videoId
  };

  // Keep in sync with shared/categories.js DEFAULT_SETTINGS.
  NS.DEFAULTS = {
    enabled: true,
    categories: {
      sponsor: true,
      selfpromo: true,
      interaction: true,
      intro: false,
      outro: false,
      preview: false,
      filler: false,
      music_offtopic: false,
      hook: false
    },
    minSegmentLength: 3,
    showTimelineMarkers: true,
    showSkipNotice: true,
    language: "en"
  };

  // Timeline-marker fill per category. Deliberate duplicate of
  // shared/categories.js CATEGORY_COLORS (the classic content tree can't import
  // the module) - keep the two in sync, like DEFAULTS above.
  NS.CATEGORY_COLORS = {
    sponsor: "#00d400",
    selfpromo: "#ffff00",
    interaction: "#cc00ff",
    intro: "#00ffff",
    outro: "#0202ed",
    preview: "#008fd6",
    filler: "#7300ff",
    music_offtopic: "#ff9900",
    hook: "#395699"
  };

  /** Namespaced debug logger (visible in the page console under a filter). */
  NS.log = (...args) => console.debug("[AutoSponsorSkipper]", ...args);

  /**
   * True while this content script's extension context is still valid. After the
   * extension is reloaded or updated, an already-injected content script is
   * orphaned and every chrome.* call throws "Extension context invalidated".
   * Storage/messaging callers check this first (and still try/catch the
   * check→call race) so an orphaned tab degrades silently until a navigation or
   * reload injects a fresh script. Skipping itself is pure DOM and is unaffected.
   * @returns {boolean}
   * @sideEffects None.
   */
  NS.contextAlive = () => {
    try {
      return !!(chrome.runtime && chrome.runtime.id);
    } catch {
      return false;
    }
  };
})();
