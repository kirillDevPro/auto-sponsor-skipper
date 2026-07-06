/**
 * popup/i18n.js — minimal localization for the popup, using the native
 * chrome.i18n message table (_locales/). English-only for v1, but wired through
 * the message table so more locales can be added later without code changes.
 */

/** Look up a localized message, falling back to the key if missing. */
export function t(key, subs) {
  return chrome.i18n.getMessage(key, subs) || key;
}

/** Replace the text/title of all [data-i18n] / [data-i18n-title] elements. */
export function localizePage(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
}
