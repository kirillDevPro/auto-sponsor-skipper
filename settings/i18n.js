/**
 * settings/i18n.js — localization for the options page. Kept separate from the
 * popup's copy per the separate-module-tree convention (intentional small
 * duplication). Uses the native chrome.i18n message table (_locales/).
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
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}
