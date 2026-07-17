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
  { code: "ar", name: "العربية" },
  { code: "bg", name: "Български" },
  { code: "cs", name: "Čeština" },
  { code: "da", name: "Dansk" },
  { code: "de", name: "Deutsch" },
  { code: "el", name: "Ελληνικά" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "et", name: "Eesti" },
  { code: "fa", name: "فارسی" },
  { code: "fi", name: "Suomi" },
  { code: "fr", name: "Français" },
  { code: "hi", name: "हिन्दी" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "lt", name: "Lietuvių" },
  { code: "no", name: "Norsk" },
  { code: "pl", name: "Polski" },
  { code: "pt_PT", name: "Português" },
  { code: "ro", name: "Română" },
  { code: "ru", name: "Русский" },
  { code: "sk", name: "Slovenčina" },
  { code: "sv", name: "Svenska" },
  { code: "tr", name: "Türkçe" },
  { code: "uk", name: "Українська" },
  { code: "zh_CN", name: "中文 (简体)" }
];

/** Just the codes, in LANGUAGES order. */
export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

/** The fallback language, whose message table is guaranteed complete. */
export const FALLBACK = "en";

/**
 * A shipped code as a BCP-47 tag. Codes are _locales directory names, which
 * Chrome spells with underscores ("pt_PT"); everything that consumes a language
 * tag — Intl.Locale, <html lang> — wants hyphens. This is the one place that
 * knows the difference.
 * @param {string} code - a shipped language code.
 * @returns {string} the same language as a BCP-47 tag.
 * @sideEffects None.
 */
export function toBcp47(code) {
  return String(code).replace(/_/g, "-");
}
