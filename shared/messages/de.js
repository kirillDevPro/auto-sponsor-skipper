/**
 * shared/messages/de.js — German UI strings for the in-page popup and options
 * runtime. This table mirrors the key set of shared/messages/en.js exactly
 * (same keys, same order); tests/i18n.test.mjs fails on drift.
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
  cat_selfpromo: "Eigenwerbung",
  cat_interaction: "Erinnerungen (Liken / Abonnieren)",
  cat_intro: "Intro / Pause",
  cat_outro: "Outro / Endkarten",
  cat_preview: "Vorschau / Zusammenfassung",
  cat_filler: "Füllmaterial / Abschweifung",
  cat_music_offtopic: "Nicht-Musik-Abschnitt",
  cat_hook: "Teaser / Begrüßung",

  // Popup.
  popup_enabled: "Überspringen aktiviert",
  popup_categories: "Diese Segmente überspringen",
  popup_skipped: "Übersprungene Segmente",
  popup_time_saved: "Gesparte Zeit",
  popup_open_settings: "Weitere Einstellungen",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Wird übersprungen:",
  popup_status_off: "Überspringen ist deaktiviert",
  popup_status_whitelisted: "Dieser Kanal steht auf der Ausnahmeliste",
  popup_status_none: "Noch keine Segmente markiert",
  popup_status_too_short: "Aktivierte Segmente liegen unter deiner Mindestlänge",
  popup_status_category_off: "Diese Segmentkategorien sind deaktiviert",
  popup_status_error: "Segmentdaten konnten nicht geladen werden",
  popup_status_checking: "Wird geprüft…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Einstellungen",
  tab_settings: "Einstellungen",
  tab_statistics: "Statistiken",
  settings_general: "Allgemein",
  settings_language: "Sprache der Benutzeroberfläche",
  settings_enabled: "Automatisches Überspringen aktivieren",
  settings_timeline_markers: "Segmentmarkierungen in der Fortschrittsleiste anzeigen",
  settings_skip_notice: "Hinweis beim Überspringen mit Rückgängig-Schaltfläche anzeigen",
  settings_categories: "Zu überspringende Kategorien",
  settings_min_length: "Mindestlänge eines Segments (Sekunden)",
  settings_min_length_hint: "Kürzere Segmente werden ignoriert. 0 = alle überspringen.",
  settings_whitelist: "Kanal-Ausnahmeliste",
  settings_whitelist_hint: "Auf diesen Kanälen wird nicht übersprungen. Füge ein Kanal-Handle (z. B. @channelname) oder eine channel/UC...-ID hinzu.",
  settings_whitelist_add: "Hinzufügen",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Keine Kanäle auf der Ausnahmeliste.",
  settings_remove: "Entfernen",
  settings_stats: "Statistiken",
  settings_stats_count: "Übersprungene Segmente",
  settings_stats_time: "Gesparte Zeit",
  settings_stats_reset: "Statistik zurücksetzen",
  settings_saved: "Gespeichert",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Übersprungen",
  notice_undo: "Rückgängig",
  notice_close: "Schließen",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Segmentdaten von SponsorBlock (sponsor.ajay.app), lizenziert unter CC BY-NC-SA 4.0.",
  not_affiliated: "Dies ist ein kostenloser, nicht kommerzieller Client mit reinem Lesezugriff. Er steht in keiner Verbindung zu SponsorBlock oder YouTube / Google, wird von ihnen weder unterstützt noch wurde er von ihnen erstellt.",
  privacy_note: "An SponsorBlock wird zum Nachschlagen der Segmente nur ein 4 Zeichen langer Hash der Video-ID gesendet. Wir betreiben keine Server, keine Analysen und kein Tracking. Deine Einstellungen werden von Chrome gespeichert und, wenn Chrome Sync aktiviert ist, mit deinen angemeldeten Browsern synchronisiert; Statistiken und die Kanal-Ausnahmeliste bleiben auf diesem Gerät."
};
