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
 * DEFAULTS below is a deliberate duplicate of shared/categories.js
 * DEFAULT_SETTINGS (the module tree can't be imported here) — keep them in sync.
 */

;(() => {
  const NS = (self.__SBSKIP__ = self.__SBSKIP__ || {});

  NS.MSG = { GET_SEGMENTS: "GET_SEGMENTS" };

  NS.STORAGE = {
    SETTINGS_KEY: "settings",       // chrome.storage.sync
    STATS_KEY: "skipStats",         // chrome.storage.local
    WHITELIST_KEY: "channelWhitelist" // chrome.storage.local
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
      music_offtopic: false
    },
    minSegmentLength: 0
  };

  /** Namespaced debug logger (visible in the page console under a filter). */
  NS.log = (...args) => console.debug("[AutoSponsorSkipper]", ...args);
})();
