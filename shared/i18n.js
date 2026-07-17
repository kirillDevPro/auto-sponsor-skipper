/**
 * shared/i18n.js - the in-page localization runtime for the popup and options
 * pages (the ES-module trees). The UI uses settings.language, stored in sync, so
 * the user can choose a language independently of the browser UI locale.
 *
 * The message tables are STATIC ES imports (shared/messages/<lang>.js): they
 * load in the privileged extension pages with no web_accessible_resources and no
 * fetch of the Chrome-reserved _locales directory. The classic content-script
 * tree cannot import modules, so it carries its own tiny category-name duplicate
 * in content/i18nStrings.js (kept in sync, like DEFAULTS / CATEGORY_COLORS).
 *
 * Static, not dynamic, on purpose: t() is synchronous and runs inside render
 * loops (localizePage per element), so a lazily-imported table would make the
 * whole call chain async. The fallback chain needs `en` loaded next to the
 * selected table anyway, and the tables are small literals read from local disk.
 * The language CATALOG lives in shared/languages.js so the service worker can
 * read it without importing any of these tables.
 *
 * t / localizePage / formatDuration have no chrome.storage dependency and are
 * testable headlessly. getLanguage / onLanguageChange touch chrome inside their
 * bodies only, so importing this module in Node stays safe.
 */

import en from "./messages/en.js";
import ru from "./messages/ru.js";
import uk from "./messages/uk.js";
import { FALLBACK } from "./languages.js";
import { SETTINGS_KEY } from "./categories.js";
import { loadSettings } from "./settingsStore.js";

// One entry per shared/languages.js code. tests/i18n.test.mjs asserts this map
// matches the catalog: a table file that exists but is missing here would make
// t() silently serve English for that whole language.
const TABLES = { en, ru, uk };

/**
 * Look up a localized string with a selected -> en -> key fallback chain.
 * @param {string} lang - selected language code.
 * @param {string} key - message key.
 * @returns {string} localized message text, the English fallback, or the key.
 * @sideEffects None.
 */
export function t(lang, key) {
  const table = TABLES[lang] || TABLES[FALLBACK];
  const msg = table[key];
  if (msg !== undefined) return msg;
  const fallback = TABLES[FALLBACK][key];
  return fallback !== undefined ? fallback : key;
}

/**
 * Localize every [data-i18n] / [data-i18n-title] / [data-i18n-placeholder]
 * element under `root` for `lang`. Safe to call repeatedly (idempotent); this
 * is how a live language switch re-renders the static page.
 * @param {ParentNode} root - parent node to localize; defaults to document.
 * @param {string} lang - selected language code.
 * @returns {void}
 * @sideEffects Updates matching elements' textContent, title, and placeholder.
 */
export function localizePage(root, lang) {
  const scope = root || document;
  scope.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(lang, el.dataset.i18n);
  });
  scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(lang, el.dataset.i18nTitle);
  });
  scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(lang, el.dataset.i18nPlaceholder);
  });
}

/**
 * Format a duration in seconds as a compact, localized two-unit string using the
 * localized short unit labels: "1 h 23 m" past an hour, "5 m 3 s" past a
 * minute, else "42 s". The output is deliberately compact for the popup and
 * statistics tiles.
 * @param {number} totalSeconds - duration in seconds.
 * @param {string} lang - selected language code.
 * @returns {string} compact localized duration.
 * @sideEffects None.
 */
export function formatDuration(totalSeconds, lang) {
  const total = Math.max(0, Math.round(totalSeconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const H = t(lang, "duration_hour_short");
  const M = t(lang, "duration_minute_short");
  const S = t(lang, "duration_second_short");
  if (h > 0) return h + " " + H + " " + m + " " + M;
  if (m > 0) return m + " " + M + " " + sec + " " + S;
  return sec + " " + S;
}

/**
 * @returns {Promise<string>} the user's selected UI language from settings.sync,
 *   defaulting to "en" (mergeSettings backfills it for existing users).
 * @sideEffects Reads chrome.storage.sync through loadSettings().
 */
export async function getLanguage() {
  const settings = await loadSettings();
  return settings.language || FALLBACK;
}

/**
 * Invoke `handler(newLang)` only when settings.language actually changes.
 * Compares the change record's oldValue.language to newValue.language (chrome
 * supplies both), so unrelated settings writes (enable / categories / min-length)
 * never fire it. `initialLang` seeds the current language for the rare case where
 * a change record has no oldValue.
 * @param {string} initialLang - the caller's current language.
 * @param {(lang: string) => void} handler - called with the new language code.
 * @returns {() => void} an unsubscribe function.
 * @sideEffects Registers a chrome.storage.onChanged listener until unsubscribed.
 */
export function onLanguageChange(initialLang, handler) {
  let currentLang = initialLang || FALLBACK;
  const listener = (changes, area) => {
    if (area !== "sync" || !changes[SETTINGS_KEY]) return;
    const rec = changes[SETTINGS_KEY];
    const oldLang = (rec.oldValue && rec.oldValue.language) || currentLang;
    const newLang = (rec.newValue && rec.newValue.language) || FALLBACK;
    if (newLang === oldLang) return;
    currentLang = newLang;
    handler(newLang);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
