/**
 * shared/i18n.js - the in-page localization runtime for the popup and options
 * pages (the ES-module trees). The effective language comes from an explicit
 * synced settings.language choice, then the machine-local browser-locale hint,
 * then English. An explicit choice is independent of the browser UI locale.
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

import ar from "./messages/ar.js";
import bg from "./messages/bg.js";
import cs from "./messages/cs.js";
import da from "./messages/da.js";
import de from "./messages/de.js";
import el from "./messages/el.js";
import en from "./messages/en.js";
import es from "./messages/es.js";
import et from "./messages/et.js";
import fa from "./messages/fa.js";
import fi from "./messages/fi.js";
import fr from "./messages/fr.js";
import hi from "./messages/hi.js";
import it from "./messages/it.js";
import ja from "./messages/ja.js";
import ko from "./messages/ko.js";
import lt from "./messages/lt.js";
import no from "./messages/no.js";
import pl from "./messages/pl.js";
import pt_PT from "./messages/pt_PT.js";
import ro from "./messages/ro.js";
import ru from "./messages/ru.js";
import sk from "./messages/sk.js";
import sv from "./messages/sv.js";
import tr from "./messages/tr.js";
import uk from "./messages/uk.js";
import zh_CN from "./messages/zh_CN.js";
import { FALLBACK, toBcp47 } from "./languages.js";
import { SETTINGS_KEY } from "./categories.js";
import { loadSettings } from "./settingsStore.js";

/**
 * One entry per shared/languages.js code. Exported so tests/i18n.test.mjs can
 * assert this map matches the catalog exactly: a table file that exists but is
 * missing here would make t() silently serve English for that whole language,
 * which no output comparison can reliably detect (a translation is allowed to
 * equal its English source).
 */
export const TABLES = {
  ar, bg, cs, da, de, el, en, es, et, fa, fi, fr, hi, it, ja, ko, lt,
  no, pl, pt_PT, ro, ru, sk, sv, tr, uk, zh_CN
};

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
 * @sideEffects Updates the page language and matching elements' textContent,
 *   title, and placeholder.
 */
export function localizePage(root, lang) {
  const scope = root || document;
  // Tell the browser what language the page is now in — screen-reader voice,
  // hyphenation and spellcheck all key off this. Text direction is deliberately
  // left alone: the layout is LTR for every shipped language.
  if (scope === document || scope === document.documentElement) {
    document.documentElement.lang = toBcp47(lang);
  }
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
 * Return the effective UI language.
 * @returns {Promise<string>} the explicit choice, browser-locale hint, or fallback.
 * @sideEffects Reads chrome.storage.sync and chrome.storage.local through loadSettings().
 */
export async function getLanguage() {
  const settings = await loadSettings();
  return settings.language || FALLBACK;
}

/**
 * Invoke `handler(newLang)` only when the EFFECTIVE UI language actually
 * changes, so an unrelated settings write (enable / categories / min-length)
 * never re-localizes the page.
 *
 * The record's newValue.language cannot simply be trusted: a user who has never
 * picked a language has NO language field in storage — theirs resolves from the
 * machine-local hint — so an absent field means "unchanged", not "English".
 * But when the field IS present it is the whole answer, so the common case (the
 * user switching languages) is handled straight from the record: no second
 * round-trip to race, and no storage failure that can swallow their switch.
 * Only the hint case asks storage, and a generation counter drops a read that a
 * newer event has already superseded.
 * @param {string} initialLang - the caller's current language.
 * @param {(lang: string) => void} handler - called with the new language code.
 * @returns {() => void} an unsubscribe function.
 * @sideEffects Registers a chrome.storage.onChanged listener until unsubscribed;
 *   reads storage only when the changed settings carry no language field.
 */
export function onLanguageChange(initialLang, handler) {
  let currentLang = initialLang || FALLBACK;
  let generation = 0;

  /**
   * Apply a resolved language, if it is actually a change.
   * @param {string} lang - the effective language code.
   * @returns {void}
   * @sideEffects Invokes the caller's handler when the language changes.
   */
  const applyLanguage = (lang) => {
    if (lang === currentLang) return;
    currentLang = lang;
    handler(lang);
  };

  /**
   * Resolve a sync settings change without allowing an older hint read to win.
   * @param {object} changes - chrome.storage change records keyed by storage key.
   * @param {string} area - the storage area that emitted the change.
   * @returns {void}
   * @sideEffects May read storage and invoke the caller's handler.
   */
  const listener = (changes, area) => {
    if (area !== "sync" || !changes[SETTINGS_KEY]) return;
    const stored = changes[SETTINGS_KEY].newValue;
    const explicit = stored && stored.language;

    if (typeof explicit === "string") {
      generation++; // supersede any hint read still in flight
      applyLanguage(explicit);
      return;
    }

    // No stored language: it comes from the hint, which lives in another area.
    const gen = ++generation;
    loadSettings()
      .then((settings) => {
        if (gen !== generation) return; // a newer change already answered this
        applyLanguage(settings.language);
      })
      .catch(() => {}); // a failed read leaves the page in its current language
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
