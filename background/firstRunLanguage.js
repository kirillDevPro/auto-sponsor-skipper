/**
 * background/firstRunLanguage.js — seeds settings.language from the browser UI
 * locale the first time the extension runs, so a user whose Chrome is in German
 * does not have to find the language selector to stop seeing English.
 *
 * Stateless, like the rest of the worker: a top-level-registered listener that
 * fires once and writes durable storage. It holds nothing in memory, so the
 * worker suspending afterwards costs nothing.
 *
 * A stored language ALWAYS wins — this only ever fills in a missing value:
 *   - reason "install": a fresh install (possibly with settings already restored
 *     by Chrome Sync — hence the read guard, not a blind write),
 *   - reason "update": only for users who never had a language stored (they
 *     predate the language selector, or never changed a setting).
 * Other reasons (chrome_update, shared_module_update) are not our event.
 *
 * The guard reads the RAW stored object rather than going through
 * shared/settingsStore.js: loadSettings() merges DEFAULT_SETTINGS, which always
 * yields a language, so it could never tell "chose English" from "never chose".
 * For the same reason the write is a raw set over the stored object, never
 * updateSettings() — whose read-fresh-merge would overwrite a language that
 * arrived from Chrome Sync between our read and our write.
 */

import { SETTINGS_KEY } from "../shared/categories.js";
import { resolveUILanguage } from "./uiLanguage.js";

/**
 * Read the raw stored settings object, unmerged.
 * @returns {Promise<object|undefined>} exactly what is in storage, if anything.
 * @sideEffects Reads chrome.storage.sync.
 */
async function readRawSettings() {
  const obj = await chrome.storage.sync.get(SETTINGS_KEY);
  return obj[SETTINGS_KEY];
}

/**
 * Seed settings.language from the browser UI locale, unless one is already stored.
 * @param {{reason: string}} details - the onInstalled details.
 * @returns {Promise<void>}
 * @sideEffects May write settings.language to chrome.storage.sync.
 */
async function seedLanguage(details) {
  if (details.reason !== "install" && details.reason !== "update") return;

  const stored = await readRawSettings();
  if (stored && typeof stored.language === "string") return; // an existing choice wins

  // Synchronous, so no await separates the guard above from the write below:
  // the only window left is a concurrent writer, which Chrome resolves
  // last-write-wins anyway.
  const language = resolveUILanguage(chrome.i18n.getUILanguage());
  await chrome.storage.sync.set({ [SETTINGS_KEY]: Object.assign({}, stored, { language }) });
}

/**
 * Register the first-run language listener. Called at top level so it survives
 * every service-worker restart.
 * @returns {void}
 * @sideEffects Adds a chrome.runtime.onInstalled listener.
 */
export function registerFirstRunLanguage() {
  chrome.runtime.onInstalled.addListener((details) => {
    // Detection is a nicety: if anything here fails the UI still opens in
    // English (DEFAULT_SETTINGS.language), so never let it reject into the
    // install path.
    seedLanguage(details).catch(() => {});
  });
}
