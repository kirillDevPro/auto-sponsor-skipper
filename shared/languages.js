/**
 * shared/languages.js — the catalog of shipped UI languages: the codes, their
 * endonyms, and the fallback. A LEAF module: it imports nothing, so importing it
 * costs one small file and never pulls in a message table.
 *
 * That isolation is the point. The service worker matches the browser UI locale
 * against this catalog on first run (background/uiLanguage.js); importing the
 * catalog from shared/i18n.js instead would drag every message table — one per
 * shipped language — into every service-worker cold start, for a list of codes.
 *
 * Codes are the _locales directory names (Chrome's own spelling: underscores,
 * e.g. pt_PT / zh_CN), so one code names a language across all four places it
 * appears: this catalog, shared/messages/<code>.js, _locales/<code>/, and the
 * content tree's NS.CAT_NAMES / NS.NOTICE_STRINGS. tests/i18n.test.mjs asserts
 * those four sets are identical.
 */

/**
 * Shipped UI languages, ordered by code (the order the options-page <select>
 * shows). `name` is the endonym — the language's own name for itself, never
 * translated and never localized into the current UI language.
 */
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "uk", name: "Українська" }
];

/** Just the codes, in LANGUAGES order. */
export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

/** The fallback language, whose message table is guaranteed complete. */
export const FALLBACK = "en";
