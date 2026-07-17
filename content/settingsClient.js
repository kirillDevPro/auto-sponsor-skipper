/**
 * content/settingsClient.js — reads user settings from chrome.storage, merges
 * them over defaults and the machine-local language hint, caches the merged
 * value in memory, and refreshes the cache when synced settings change so a
 * popup/options toggle takes effect without a page reload. The whitelist is
 * read on demand.
 */

;(() => {
  const NS = self.__SBSKIP__;
  let cache = null;

  // The browser-locale language hint (chrome.storage.local), which applies only
  // until the user picks a language. Cached from load() so the sync-storage
  // onChanged path can re-merge without a second read.
  let langHint = null;

  /**
   * Merge a stored (possibly partial) settings object over DEFAULTS.
   * @param {object|null|undefined} stored - value read from chrome.storage.sync.
   * @param {string|null} [hint] - browser-locale language hint; an explicit
   *   stored.language always wins over it.
   * @returns {object} complete settings object used by the content script.
   * @sideEffects None.
   */
  function merge(stored, hint) {
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
      showSkipNotice:
        typeof s.showSkipNotice === "boolean" ? s.showSkipNotice : d.showSkipNotice,
      // Explicit choice > browser-locale hint > English.
      language:
        typeof s.language === "string"
          ? s.language
          : typeof hint === "string"
            ? hint
            : d.language
    };
  }

  NS.settings = {
    /**
     * Load and cache settings: the synced settings object plus the local
     * browser-locale language hint.
     * @returns {Promise<object>} merged settings.
     * @sideEffects Reads chrome.storage.sync + chrome.storage.local, updates the cache.
     */
    async load() {
      const [synced, local] = await Promise.all([
        chrome.storage.sync.get(NS.STORAGE.SETTINGS_KEY),
        chrome.storage.local.get(NS.STORAGE.LANG_HINT_KEY)
      ]);
      langHint = local[NS.STORAGE.LANG_HINT_KEY] || null;
      cache = merge(synced[NS.STORAGE.SETTINGS_KEY], langHint);
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
     * @returns {Promise<string[]>} stored whitelist, [] only after context death.
     * @sideEffects Reads chrome.storage.local.
     */
    async whitelist() {
      // Runs on every navigation, which can happen in an orphaned content script
      // (extension reloaded/updated); degrade to "no whitelist" ONLY for context
      // death. A genuine storage failure on a live context is rethrown so the
      // orchestrator fails closed (bails before apply → no skipping) instead of
      // skipping on a channel the user explicitly whitelisted.
      if (!NS.contextAlive()) return [];
      try {
        const obj = await chrome.storage.local.get(NS.STORAGE.WHITELIST_KEY);
        return obj[NS.STORAGE.WHITELIST_KEY] || [];
      } catch (e) {
        if (!NS.contextAlive()) return []; // context died mid-call → orphaned tab
        throw e; // genuine storage failure → let the caller fail closed
      }
    }
  };

  /**
   * True if a field that changes skipping or marker rendering changed.
   * `language` and `showSkipNotice` are read live by their UI paths, so toggling
   * either must not trigger a reapply that resets the skip cooldown and could
   * re-skip a segment the user scrubbed back into. Compares against the
   * existing cached settings, not the change record.
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

  /**
   * Refresh cached settings or notify the current channel after storage changes.
   * @param {object} changes - chrome.storage change records keyed by storage key.
   * @param {string} area - the storage area that emitted the change.
   * @returns {void}
   * @sideEffects Updates the cache and may invoke content callbacks.
   */
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[NS.STORAGE.SETTINGS_KEY]) {
      const prev = cache;
      // Always refresh the cache (so NS.i18n.catName sees the new language), but
      // reapply skipping/markers only when a content-relevant field changed.
      cache = merge(changes[NS.STORAGE.SETTINGS_KEY].newValue, langHint);
      if (typeof NS.onSettingsChanged === "function" && affectsContent(prev, cache)) {
        NS.onSettingsChanged(cache);
      }
      // showSkipNotice is intentionally NOT in affectsContent (toggling it must not
      // reset the skip cooldown — it's read live at skip time). But turning it OFF
      // should hide a notice that's currently on screen; do that without a reapply.
      // (Guarded because this early-loaded module can fire before skipNotice.js in
      // the rare change-during-injection window.)
      if (prev && prev.showSkipNotice && !cache.showSkipNotice && NS.skipNotice) {
        NS.skipNotice.clear();
      }
    }
    // The whitelist lives in local storage; a change must re-evaluate the
    // current channel so whitelisting/un-whitelisting applies without a reload.
    if (area === "local" && changes[NS.STORAGE.WHITELIST_KEY]) {
      if (typeof NS.onWhitelistChanged === "function") NS.onWhitelistChanged();
    }
  });
})();
