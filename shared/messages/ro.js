/**
 * shared/messages/ro.js — Romanian UI strings for the in-page popup and options
 * runtime. This table MUST carry the identical key set as shared/messages/en.js
 * (the source-of-truth locale); tests/i18n.test.mjs fails on drift.
 *
 * These are the IN-PAGE strings only. The manifest name/description live
 * separately in _locales/ (native chrome.i18n, browser-locale for the Chrome
 * Web Store listing). `extName` is intentionally in BOTH places: the popup <h1>
 * localizes it in-page, the manifest localizes it for chrome://extensions.
 * `extName` is a brand name — keep it byte-identical across every locale (never
 * translate it).
 */

export default {
  extName: "Auto Sponsor Skipper",

  // SponsorBlock skip categories (keys match CATEGORIES[].i18nKey).
  cat_sponsor: "Sponsor",
  cat_selfpromo: "Autopromovare",
  cat_interaction: "Mementouri (like / abonare)",
  cat_intro: "Intro / pauză",
  cat_outro: "Outro / carduri finale",
  cat_preview: "Previzualizare / recapitulare",
  cat_filler: "Umplutură / divagație",
  cat_music_offtopic: "Secțiune non-muzicală",
  cat_hook: "Teaser / salut",

  // Popup.
  popup_enabled: "Omitere activată",
  popup_categories: "Sari peste aceste segmente",
  popup_skipped: "Segmente omise",
  popup_time_saved: "Timp economisit",
  popup_open_settings: "Mai multe setări",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Se va omite:",
  popup_status_off: "Omiterea este dezactivată",
  popup_status_whitelisted: "Acest canal este în lista albă",
  popup_status_none: "Niciun segment marcat încă",
  popup_status_too_short: "Segmentele activate sunt sub durata ta minimă",
  popup_status_category_off: "Aceste categorii de segmente sunt dezactivate",
  popup_status_error: "Datele segmentelor nu au putut fi încărcate",
  popup_status_checking: "Se verifică…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Setări",
  tab_settings: "Setări",
  tab_statistics: "Statistici",
  settings_general: "General",
  settings_language: "Limba interfeței",
  settings_enabled: "Activează omiterea automată",
  settings_timeline_markers: "Afișează marcajele segmentelor pe bara de progres",
  settings_skip_notice: "Afișează o notificare de omitere cu buton de anulare",
  settings_categories: "Categorii de omis",
  settings_min_length: "Durata minimă a segmentului (secunde)",
  settings_min_length_hint: "Segmentele mai scurte de atât sunt ignorate. 0 = omite tot.",
  settings_whitelist: "Listă albă de canale",
  settings_whitelist_hint: "Omiterea este dezactivată pe aceste canale. Adaugă identificatorul unui canal (ex. @channelname) sau un id channel/UC... .",
  settings_whitelist_add: "Adaugă",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Niciun canal în lista albă.",
  settings_remove: "Elimină",
  settings_stats: "Statistici",
  settings_stats_count: "Segmente omise",
  settings_stats_time: "Timp economisit",
  settings_stats_reset: "Resetează statisticile",
  settings_saved: "Salvat",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Omis",
  notice_undo: "Anulează",
  notice_close: "Închide",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Date despre segmente oferite de SponsorBlock (sponsor.ajay.app), licențiate CC BY-NC-SA 4.0.",
  not_affiliated: "Acesta este un client gratuit, necomercial și doar pentru citire, care nu este afiliat cu, aprobat de sau creat de SponsorBlock ori YouTube / Google.",
  privacy_note: "Către SponsorBlock se trimite doar un hash de 4 caractere al ID-ului videoclipului, pentru a căuta segmentele. Nu operăm servere, nu folosim analize și nu facem urmărire. Setările tale sunt stocate de Chrome și, dacă ai Chrome Sync activat, sunt sincronizate între browserele în care ești autentificat; statisticile și lista albă de canale rămân pe acest dispozitiv."
};
