/**
 * shared/messages/sv.js — Swedish UI strings (mirrors the key set of en.js, the
 * source-of-truth locale for the in-page popup and options runtime). Every
 * message table in this folder MUST carry the identical key set;
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
  cat_selfpromo: "Egenreklam",
  cat_interaction: "Påminnelser (gilla / prenumerera)",
  cat_intro: "Intro / paus",
  cat_outro: "Outro / slutkort",
  cat_preview: "Förhandsvisning / sammanfattning",
  cat_filler: "Utfyllnad / sidospår",
  cat_music_offtopic: "Icke-musikavsnitt",
  cat_hook: "Teaser / hälsning",

  // Popup.
  popup_enabled: "Överhoppning aktiverad",
  popup_categories: "Hoppa över dessa segment",
  popup_skipped: "Överhoppade segment",
  popup_time_saved: "Sparad tid",
  popup_open_settings: "Fler inställningar",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Hoppar över:",
  popup_status_off: "Överhoppning är avstängd",
  popup_status_whitelisted: "Den här kanalen är vitlistad",
  popup_status_none: "Inga segment markerade ännu",
  popup_status_too_short: "Aktiverade segment är kortare än din minimilängd",
  popup_status_category_off: "Dessa segmentkategorier är avstängda",
  popup_status_error: "Kunde inte hämta segmentdata",
  popup_status_checking: "Kontrollerar…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Inställningar",
  tab_settings: "Inställningar",
  tab_statistics: "Statistik",
  settings_general: "Allmänt",
  settings_language: "Språk",
  settings_enabled: "Aktivera automatisk överhoppning",
  settings_timeline_markers: "Visa segmentmarkörer på förloppsindikatorn",
  settings_skip_notice: "Visa en avisering med ångra-knapp vid överhoppning",
  settings_categories: "Kategorier att hoppa över",
  settings_min_length: "Minsta segmentlängd (sekunder)",
  settings_min_length_hint: "Segment kortare än så här ignoreras. 0 = hoppa över alla.",
  settings_whitelist: "Kanalvitlista",
  settings_whitelist_hint: "Överhoppning är avstängd på dessa kanaler. Lägg till ett kanalhandtag (t.ex. @channelname) eller ett channel/UC...-id.",
  settings_whitelist_add: "Lägg till",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Inga kanaler är vitlistade.",
  settings_remove: "Ta bort",
  settings_stats: "Statistik",
  settings_stats_count: "Överhoppade segment",
  settings_stats_time: "Sparad tid",
  settings_stats_reset: "Återställ statistik",
  settings_saved: "Sparat",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Hoppade över",
  notice_undo: "Ångra",
  notice_close: "Stäng",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Segmentdata från SponsorBlock (sponsor.ajay.app), licensierad under CC BY-NC-SA 4.0.",
  not_affiliated: "Detta är en gratis, icke-kommersiell klient som endast läser data och är inte ansluten till, godkänd av eller skapad av SponsorBlock eller YouTube / Google.",
  privacy_note: "Endast en hash på 4 tecken av video-ID:t skickas till SponsorBlock för att slå upp segment. Vi driver inga servrar, ingen analys och ingen spårning. Dina inställningar lagras av Chrome och synkroniseras, om du har Chrome Sync påslaget, mellan de webbläsare du är inloggad i; statistik och kanalvitlistan stannar på den här enheten."
};
