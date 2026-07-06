/**
 * content/settingsClient.js — reads user settings from chrome.storage, merges
 * them over defaults, caches the merged value in memory, and live-updates on
 * chrome.storage.onChanged so a toggle in the popup/options takes effect
 * without a page reload. The whitelist is read on demand (it changes rarely).
 */

;(() => {
  const NS = self.__SBSKIP__;
  let cache = null;

  /** Merge a stored (possibly partial) settings object over DEFAULTS. */
  function merge(stored) {
    const d = NS.DEFAULTS;
    const s = stored || {};
    return {
      enabled: s.enabled !== undefined ? s.enabled : d.enabled,
      categories: Object.assign({}, d.categories, s.categories || {}),
      minSegmentLength:
        typeof s.minSegmentLength === "number" ? s.minSegmentLength : d.minSegmentLength
    };
  }

  NS.settings = {
    /** Load + cache settings from sync storage. */
    async load() {
      const obj = await chrome.storage.sync.get(NS.STORAGE.SETTINGS_KEY);
      cache = merge(obj[NS.STORAGE.SETTINGS_KEY]);
      return cache;
    },
    /** Last loaded settings (defaults until load() runs). */
    get() {
      return cache || NS.DEFAULTS;
    },
    /** Read the channel whitelist array from local storage. */
    async whitelist() {
      const obj = await chrome.storage.local.get(NS.STORAGE.WHITELIST_KEY);
      return obj[NS.STORAGE.WHITELIST_KEY] || [];
    }
  };

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[NS.STORAGE.SETTINGS_KEY]) {
      cache = merge(changes[NS.STORAGE.SETTINGS_KEY].newValue);
      if (typeof NS.onSettingsChanged === "function") NS.onSettingsChanged(cache);
    }
    // The whitelist lives in local storage; a change must re-evaluate the
    // current channel so whitelisting/un-whitelisting applies without a reload.
    if (area === "local" && changes[NS.STORAGE.WHITELIST_KEY]) {
      if (typeof NS.onWhitelistChanged === "function") NS.onWhitelistChanged();
    }
  });
})();
