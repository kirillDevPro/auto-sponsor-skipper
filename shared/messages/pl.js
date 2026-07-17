/**
 * shared/messages/pl.js — Polish UI strings (mirrors the en.js key set exactly).
 * Every message table in this folder MUST carry the identical key set;
 * tests/i18n.test.mjs fails on drift.
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
  cat_selfpromo: "Autopromocja",
  cat_interaction: "Przypomnienia (łapka / subskrypcja)",
  cat_intro: "Intro / przerwa",
  cat_outro: "Outro / karty końcowe",
  cat_preview: "Zapowiedź / podsumowanie",
  cat_filler: "Wypełniacz / dygresja",
  cat_music_offtopic: "Sekcja niemuzyczna",
  cat_hook: "Zajawka / powitanie",

  // Popup.
  popup_enabled: "Pomijanie włączone",
  popup_categories: "Pomijaj te segmenty",
  popup_skipped: "Pominięte segmenty",
  popup_time_saved: "Zaoszczędzony czas",
  popup_open_settings: "Więcej ustawień",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Zostanie pominięte:",
  popup_status_off: "Pomijanie jest wyłączone",
  popup_status_whitelisted: "Ten kanał jest na białej liście",
  popup_status_none: "Brak oznaczonych segmentów",
  popup_status_too_short: "Włączone segmenty są krótsze niż Twoja minimalna długość",
  popup_status_category_off: "Te kategorie segmentów są wyłączone",
  popup_status_error: "Nie udało się wczytać danych o segmentach",
  popup_status_checking: "Sprawdzanie…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Ustawienia",
  tab_settings: "Ustawienia",
  tab_statistics: "Statystyki",
  settings_general: "Ogólne",
  settings_language: "Język interfejsu",
  settings_enabled: "Włącz automatyczne pomijanie",
  settings_timeline_markers: "Pokazuj znaczniki segmentów na pasku postępu",
  settings_skip_notice: "Pokazuj powiadomienie o pominięciu z przyciskiem cofania",
  settings_categories: "Kategorie do pomijania",
  settings_min_length: "Minimalna długość segmentu (sekundy)",
  settings_min_length_hint: "Segmenty krótsze niż ta wartość są ignorowane. 0 = pomijaj wszystkie.",
  settings_whitelist: "Biała lista kanałów",
  settings_whitelist_hint: "Pomijanie jest wyłączone na tych kanałach. Dodaj nazwę kanału (np. @channelname) lub identyfikator channel/UC...",
  settings_whitelist_add: "Dodaj",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Brak kanałów na białej liście.",
  settings_remove: "Usuń",
  settings_stats: "Statystyki",
  settings_stats_count: "Pominięte segmenty",
  settings_stats_time: "Zaoszczędzony czas",
  settings_stats_reset: "Resetuj statystyki",
  settings_saved: "Zapisano",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Pominięto",
  notice_undo: "Cofnij",
  notice_close: "Zamknij",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "g",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Dane o segmentach pochodzą od SponsorBlock (sponsor.ajay.app), na licencji CC BY-NC-SA 4.0.",
  not_affiliated: "To bezpłatny, niekomercyjny klient tylko do odczytu, który nie jest powiązany z SponsorBlock ani YouTube / Google, nie jest przez nie wspierany ani przez nie stworzony.",
  privacy_note: "Do SponsorBlock wysyłany jest tylko 4-znakowy skrót identyfikatora filmu, aby wyszukać segmenty. Nie prowadzimy żadnych serwerów, analityki ani śledzenia. Twoje ustawienia są przechowywane przez Chrome i, jeśli masz włączoną funkcję Chrome Sync, synchronizowane między Twoimi zalogowanymi przeglądarkami; statystyki i biała lista kanałów pozostają na tym urządzeniu."
};
