/**
 * content/settingsClient.js — reads user settings from chrome.storage, merges
 * them over defaults, caches the merged value in memory, and live-updates on
 * chrome.storage.onChanged so a toggle in the popup/options takes effect
 * without a page reload. The whitelist is read on demand (it changes rarely).
 */

;(() => {
  const NS = self.__SBSKIP__;
  let cache = null;

  /**
   * Merge a stored (possibly partial) settings object over DEFAULTS.
   * @param {object|null|undefined} stored - value read from chrome.storage.sync.
   * @returns {object} complete settings object used by the content script.
   * @sideEffects None.
   */
  function merge(stored) {
    const d = NS.DEFAULTS;
    const s = stored || {};
    return {
      enabled: s.enabled !== undefined ? s.enabled : d.enabled,
      categories: Object.assign({}, d.categories, s.categories || {}),
      minSegmentLength:
        typeof s.minSegmentLength === "number" ? s.minSegmentLength : d.minSegmentLength,
      showTimelineMarkers:
        typeof s.showTimelineMarkers === "boolean"
          ? s.showTimelineMarkers
          : d.showTimelineMarkers,
      language: typeof s.language === "string" ? s.language : d.language
    };
  }

  NS.settings = {
    /**
     * Load and cache settings from sync storage.
     * @returns {Promise<object>} merged settings.
     * @sideEffects Reads chrome.storage.sync and updates the in-memory cache.
     */
    async load() {
      const obj = await chrome.storage.sync.get(NS.STORAGE.SETTINGS_KEY);
      cache = merge(obj[NS.STORAGE.SETTINGS_KEY]);
      return cache;
    },
    /**
     * Return the last loaded settings.
     * @returns {object} cached settings, or defaults until load() runs.
     * @sideEffects None.
     */
    get() {
      return cache || NS.DEFAULTS;
    },
    /**
     * Read the channel whitelist array from local storage.
     * @returns {Promise<string[]>} stored whitelist, or an empty array.
     * @sideEffects Reads chrome.storage.local.
     */
    async whitelist() {
      const obj = await chrome.storage.local.get(NS.STORAGE.WHITELIST_KEY);
      return obj[NS.STORAGE.WHITELIST_KEY] || [];
    }
  };

  /**
   * True if a field the content script acts on changed (skip logic or timeline
   * markers). `language` is UI-only; the tooltip reads it live via
   * NS.i18n.catName, so a language-only change must not trigger a reapply, which
   * resets the skip cooldown and could re-skip a segment the user scrubbed back
   * into. Compares against the previously cached settings, not the change record.
   * @param {object|null} prev - previous cached settings.
   * @param {object} next - newly merged settings.
   * @returns {boolean} true when skip logic or marker rendering should reapply.
   * @sideEffects None.
   */
  function affectsContent(prev, next) {
    if (!prev) return true;
    if (prev.enabled !== next.enabled) return true;
    if (prev.minSegmentLength !== next.minSegmentLength) return true;
    if (prev.showTimelineMarkers !== next.showTimelineMarkers) return true;
    const a = prev.categories || {};
    const b = next.categories || {};
    for (const k in b) if (a[k] !== b[k]) return true;
    return false;
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[NS.STORAGE.SETTINGS_KEY]) {
      const prev = cache;
      // Always refresh the cache (so NS.i18n.catName sees the new language), but
      // reapply skipping/markers only when a content-relevant field changed.
      cache = merge(changes[NS.STORAGE.SETTINGS_KEY].newValue);
      if (typeof NS.onSettingsChanged === "function" && affectsContent(prev, cache)) {
        NS.onSettingsChanged(cache);
      }
    }
    // The whitelist lives in local storage; a change must re-evaluate the
    // current channel so whitelisting/un-whitelisting applies without a reload.
    if (area === "local" && changes[NS.STORAGE.WHITELIST_KEY]) {
      if (typeof NS.onWhitelistChanged === "function") NS.onWhitelistChanged();
    }
  });
})();
