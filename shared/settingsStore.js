/**
 * shared/settingsStore.js — ES-module storage helpers shared by the popup and
 * the options page (both module contexts). The content script tree is classic
 * and keeps its own read path in content/settingsClient.js; this module is the
 * single read/write surface for the two UI pages.
 */

import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  STATS_KEY,
  WHITELIST_KEY
} from "./categories.js";

/**
 * Merge a stored (possibly partial) settings object over DEFAULT_SETTINGS.
 * @param {object|null|undefined} stored - value read from chrome.storage.sync.
 * @returns {object} complete settings object for UI surfaces.
 * @sideEffects None.
 */
export function mergeSettings(stored) {
  const s = stored || {};
  return {
    enabled: s.enabled !== undefined ? s.enabled : DEFAULT_SETTINGS.enabled,
    categories: Object.assign({}, DEFAULT_SETTINGS.categories, s.categories || {}),
    minSegmentLength:
      typeof s.minSegmentLength === "number"
        ? s.minSegmentLength
        : DEFAULT_SETTINGS.minSegmentLength,
    showTimelineMarkers:
      typeof s.showTimelineMarkers === "boolean"
        ? s.showTimelineMarkers
        : DEFAULT_SETTINGS.showTimelineMarkers,
    showSkipNotice:
      typeof s.showSkipNotice === "boolean"
        ? s.showSkipNotice
        : DEFAULT_SETTINGS.showSkipNotice,
    language:
      typeof s.language === "string" ? s.language : DEFAULT_SETTINGS.language
  };
}

/**
 * Load merged settings from chrome.storage.sync.
 * @returns {Promise<object>} complete settings object.
 * @sideEffects Reads chrome.storage.sync.
 */
export async function loadSettings() {
  const obj = await chrome.storage.sync.get(SETTINGS_KEY);
  return mergeSettings(obj[SETTINGS_KEY]);
}

/**
 * Persist the settings object to chrome.storage.sync.
 * @param {object} settings - complete settings object to store.
 * @returns {Promise<void>}
 * @sideEffects Writes chrome.storage.sync.
 */
export async function saveSettings(settings) {
  await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
}

// Writes from one page are serialized through this chain so two rapid calls
// can't both read the old value before either saves (an intra-page lost update).
let settingsChain = Promise.resolve();

/**
 * Read the CURRENT settings from storage, apply `mutate` to that fresh copy,
 * and write it back — with calls from this page serialized so they can't
 * interleave. Reading fresh each time means a stale in-memory snapshot in one
 * surface (e.g. a long-lived options tab) can't clobber a change made in
 * another (the popup). Each handler should change only the field it owns inside
 * `mutate`. (Two DIFFERENT pages writing within the same storage round-trip is
 * an inherent chrome.storage race with a sub-millisecond window; not worth a
 * cross-context lock for a settings UI.)
 * @param {(settings: object) => void} mutate
 * @returns {Promise<object>} the written settings.
 * @sideEffects Reads and writes chrome.storage.sync through the serialized chain.
 */
export function updateSettings(mutate) {
  const run = settingsChain.then(async () => {
    const settings = await loadSettings();
    mutate(settings);
    await saveSettings(settings);
    return settings;
  });
  settingsChain = run.catch(() => {}); // keep the chain alive after a failure
  return run;
}

/**
 * Load skip statistics from chrome.storage.local.
 * @returns {Promise<{count:number, seconds:number}>} skip statistics.
 * @sideEffects Reads chrome.storage.local.
 */
export async function loadStats() {
  const obj = await chrome.storage.local.get(STATS_KEY);
  return obj[STATS_KEY] || { count: 0, seconds: 0 };
}

/**
 * Reset skip statistics to zero.
 * @returns {Promise<void>}
 * @sideEffects Writes chrome.storage.local.
 */
export async function resetStats() {
  await chrome.storage.local.set({ [STATS_KEY]: { count: 0, seconds: 0 } });
}

/**
 * Load the channel whitelist from chrome.storage.local.
 * @returns {Promise<string[]>} the channel whitelist.
 * @sideEffects Reads chrome.storage.local.
 */
export async function loadWhitelist() {
  const obj = await chrome.storage.local.get(WHITELIST_KEY);
  return obj[WHITELIST_KEY] || [];
}

/**
 * Persist the channel whitelist array.
 * @param {string[]} list - normalized channel ids/handles.
 * @returns {Promise<void>}
 * @sideEffects Writes chrome.storage.local.
 */
export async function saveWhitelist(list) {
  await chrome.storage.local.set({ [WHITELIST_KEY]: list });
}

// Serializes whitelist writes from this page, same rationale as updateSettings.
let whitelistChain = Promise.resolve();

/**
 * Read the CURRENT whitelist, transform it, and write it back — serialized and
 * read-fresh so two open options tabs can't clobber each other's edits.
 * @param {(list: string[]) => string[]} transform - returns the new array.
 * @returns {Promise<string[]>} the written whitelist.
 * @sideEffects Reads and writes chrome.storage.local through the serialized chain.
 */
export function updateWhitelist(transform) {
  const run = whitelistChain.then(async () => {
    const list = await loadWhitelist();
    const next = transform(list.slice()) || [];
    await saveWhitelist(next);
    return next;
  });
  whitelistChain = run.catch(() => {});
  return run;
}
