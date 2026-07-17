/**
 * background/firstRunLanguage.js — records the browser's UI locale as a language
 * HINT when the extension is installed or updated, so a user whose Chrome is in
 * German does not have to find the language selector to stop seeing English.
 *
 * It records a hint; it does not make a choice. The hint goes to its own
 * chrome.storage.LOCAL key (LANG_HINT_KEY) and the settings object is never
 * touched. That separation is what makes this safe:
 *   - An explicit choice always wins, structurally rather than by a guard:
 *     every reader prefers settings.language and only falls back to the hint
 *     (shared/settingsStore.js mergeSettings, content/settingsClient.js).
 *   - It cannot clobber Chrome Sync. A read-then-write of the synced settings
 *     item would race the sync restore that lands seconds after a fresh install
 *     on a second machine: our write, built from the pre-restore snapshot, could
 *     win the conflict and wipe the categories/language the user had set on
 *     their other machine. Writing a different key in a different area
 *     removes that failure mode instead of narrowing its window.
 *   - Local, not sync, because the hint describes THIS browser's UI locale.
 *     Syncing it would push one machine's browser language onto another's.
 *
 * Stateless, like the rest of the worker: a top-level-registered listener writes
 * durable storage for qualifying lifecycle events and holds nothing in memory.
 */

import { LANG_HINT_KEY } from "../shared/categories.js";
import { resolveUILanguage } from "./uiLanguage.js";

/**
 * Record the browser UI locale as the language hint.
 * @param {{reason: string}} details - the onInstalled details.
 * @returns {Promise<void>}
 * @sideEffects For install/update, reads chrome.i18n and writes LANG_HINT_KEY to
 *   chrome.storage.local.
 */
async function recordLanguageHint(details) {
  // "install" records the initial hint. "update" refreshes the machine-local
  // hint, which affects only users without an explicit settings.language choice.
  // chrome_update / shared_module_update are not our event.
  if (details.reason !== "install" && details.reason !== "update") return;

  const language = resolveUILanguage(chrome.i18n.getUILanguage());
  await chrome.storage.local.set({ [LANG_HINT_KEY]: language });
}

/**
 * Register the first-run language listener. Called at top level so it survives
 * every service-worker restart.
 * @returns {void}
 * @sideEffects Adds a chrome.runtime.onInstalled listener.
 */
export function registerFirstRunLanguage() {
  chrome.runtime.onInstalled.addListener((details) => {
    // The hint is a nicety: if detection or the write fails the UI still opens
    // in English (DEFAULT_SETTINGS.language), so never reject into the install path.
    recordLanguageHint(details).catch(() => {});
  });
}
