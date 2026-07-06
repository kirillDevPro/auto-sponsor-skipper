/**
 * shared/categories.js — single source of truth for the SponsorBlock skip
 * categories, the default settings shape, and the chrome.storage keys.
 *
 * This is an ES module. It is imported directly by the service worker
 * (background/, type:module), the popup, and the options page (all modules).
 * The CONTENT script tree is loaded as classic scripts (no ES imports), so it
 * carries a deliberately-duplicated copy of DEFAULT_SETTINGS + the keys in
 * content/config.js — keep the two in sync (separate module-tree convention).
 *
 * Only categories whose SponsorBlock actionType is "skip" belong here. The
 * non-skip categories (poi_highlight, exclusive_access, chapter) are excluded
 * on purpose so the UI never shows a toggle that can't do anything.
 */

/** Ordered category catalog. `defaultOn` seeds a fresh install. */
export const CATEGORIES = [
  { id: "sponsor",        defaultOn: true,  i18nKey: "cat_sponsor" },
  { id: "selfpromo",      defaultOn: true,  i18nKey: "cat_selfpromo" },
  { id: "interaction",    defaultOn: true,  i18nKey: "cat_interaction" },
  { id: "intro",          defaultOn: false, i18nKey: "cat_intro" },
  { id: "outro",          defaultOn: false, i18nKey: "cat_outro" },
  { id: "preview",        defaultOn: false, i18nKey: "cat_preview" },
  { id: "filler",         defaultOn: false, i18nKey: "cat_filler" },
  { id: "music_offtopic", defaultOn: false, i18nKey: "cat_music_offtopic" }
];

/** All category ids — the superset the service worker queries from the API. */
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/** Default settings object stored under SETTINGS_KEY in chrome.storage.sync. */
export const DEFAULT_SETTINGS = {
  enabled: true,
  categories: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultOn])),
  minSegmentLength: 0
};

/** chrome.storage.sync key holding the DEFAULT_SETTINGS-shaped object. */
export const SETTINGS_KEY = "settings";
/** chrome.storage.local key holding { count, seconds }. */
export const STATS_KEY = "skipStats";
/** chrome.storage.local key holding an array of channel ids/handles. */
export const WHITELIST_KEY = "channelWhitelist";
