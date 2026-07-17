/**
 * shared/categories.js — single source of truth for the SponsorBlock skip
 * categories, the default settings shape, and the chrome.storage keys.
 *
 * This is an ES module. It is imported directly by the service worker
 * (background/, type:module), the popup, and the options page (all modules).
 * The CONTENT script tree is loaded as classic scripts (no ES imports), so it
 * carries deliberate duplicates of DEFAULT_SETTINGS, CATEGORY_COLORS, and the
 * storage keys in content/config.js - keep those in sync (separate module-tree
 * convention).
 *
 * Only categories whose SponsorBlock actionType is "skip" belong here. The
 * non-skip categories (poi_highlight, exclusive_access, chapter) are excluded
 * on purpose so the UI never shows a toggle that can't do anything.
 */

/**
 * Ordered category catalog. `defaultOn` seeds a fresh install; `color` is the
 * timeline-marker fill and matches SponsorBlock's canonical per-category colors
 * (from its src/config.ts barTypes) so markers read as the familiar SponsorBlock
 * palette.
 */
export const CATEGORIES = [
  { id: "sponsor",        defaultOn: true,  i18nKey: "cat_sponsor",        color: "#00d400" },
  { id: "selfpromo",      defaultOn: true,  i18nKey: "cat_selfpromo",      color: "#ffff00" },
  { id: "interaction",    defaultOn: true,  i18nKey: "cat_interaction",    color: "#cc00ff" },
  { id: "intro",          defaultOn: false, i18nKey: "cat_intro",          color: "#00ffff" },
  { id: "outro",          defaultOn: false, i18nKey: "cat_outro",          color: "#0202ed" },
  { id: "preview",        defaultOn: false, i18nKey: "cat_preview",        color: "#008fd6" },
  { id: "filler",         defaultOn: false, i18nKey: "cat_filler",         color: "#7300ff" },
  { id: "music_offtopic", defaultOn: false, i18nKey: "cat_music_offtopic", color: "#ff9900" },
  { id: "hook",           defaultOn: false, i18nKey: "cat_hook",           color: "#395699" }
];

/** All category ids — the superset the service worker queries from the API. */
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/**
 * Category id → timeline-marker color. The content script tree is classic (no
 * imports), so it carries a deliberate duplicate of this map in
 * content/config.js (NS.CATEGORY_COLORS) — keep the two in sync, exactly like
 * DEFAULT_SETTINGS / NS.DEFAULTS.
 */
export const CATEGORY_COLORS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]));

/** Default settings object stored under SETTINGS_KEY in chrome.storage.sync. */
export const DEFAULT_SETTINGS = {
  enabled: true,
  categories: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultOn])),
  minSegmentLength: 3,
  showTimelineMarkers: true,
  // Show a brief "skipped — undo" notice over the player after each skip.
  showSkipNotice: true,
  // The user's EXPLICIT UI-language choice for the in-page popup/options runtime
  // (shared/i18n.js). Absent until they pick one, which is what lets the
  // browser-locale hint (LANG_HINT_KEY) apply; once present it always wins.
  language: "en"
};

/** chrome.storage.sync key holding the DEFAULT_SETTINGS-shaped object. */
export const SETTINGS_KEY = "settings";
/**
 * chrome.storage.LOCAL key holding the browser-locale language hint the service
 * worker detects on first run (background/firstRunLanguage.js). Deliberately
 * NOT part of the settings object and deliberately NOT synced: it describes THIS
 * browser's UI locale, which differs per machine, and keeping it out of the
 * synced settings item means first-run detection can never overwrite settings
 * that Chrome Sync is restoring at that moment. It only ever applies when the
 * user has made no explicit choice — settings.language outranks it.
 */
export const LANG_HINT_KEY = "languageHint";
/** chrome.storage.local key holding { count, seconds }. */
export const STATS_KEY = "skipStats";
/** chrome.storage.local key holding an array of channel ids/handles. */
export const WHITELIST_KEY = "channelWhitelist";
