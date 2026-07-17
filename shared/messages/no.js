/**
 * shared/messages/no.js — Norwegian Bokmal UI strings (mirrors the key set of
 * en.js, the source-of-truth locale for the in-page popup and options runtime).
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
  cat_selfpromo: "Egenreklame",
  cat_interaction: "Påminnelser (lik / abonner)",
  cat_intro: "Intro / pause",
  cat_outro: "Outro / sluttkort",
  cat_preview: "Forhåndsvisning / oppsummering",
  cat_filler: "Fyllstoff / digresjon",
  cat_music_offtopic: "Del uten musikk",
  cat_hook: "Teaser / hilsen",

  // Popup.
  popup_enabled: "Hopping aktivert",
  popup_categories: "Hopp over disse segmentene",
  popup_skipped: "Segmenter hoppet over",
  popup_time_saved: "Tid spart",
  popup_open_settings: "Flere innstillinger",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Hopper over:",
  popup_status_off: "Hopping er slått av",
  popup_status_whitelisted: "Denne kanalen står på hvitelisten",
  popup_status_none: "Ingen segmenter er markert ennå",
  popup_status_too_short: "Aktiverte segmenter er kortere enn minstelengden din",
  popup_status_category_off: "Disse segmentkategoriene er slått av",
  popup_status_error: "Kunne ikke laste segmentdata",
  popup_status_checking: "Sjekker…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Innstillinger",
  tab_settings: "Innstillinger",
  tab_statistics: "Statistikk",
  settings_general: "Generelt",
  settings_language: "Grensesnittspråk",
  settings_enabled: "Aktiver automatisk hopping",
  settings_timeline_markers: "Vis segmentmarkører på fremdriftslinjen",
  settings_skip_notice: "Vis et varsel med angreknapp ved hopp",
  settings_categories: "Kategorier å hoppe over",
  settings_min_length: "Minste segmentlengde (sekunder)",
  settings_min_length_hint: "Segmenter kortere enn dette ignoreres. 0 = hopp over alle.",
  settings_whitelist: "Hviteliste for kanaler",
  settings_whitelist_hint: "Hopping er deaktivert på disse kanalene. Legg til et kanalnavn (f.eks. @channelname) eller en channel/UC...-id.",
  settings_whitelist_add: "Legg til",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Ingen kanaler på hvitelisten.",
  settings_remove: "Fjern",
  settings_stats: "Statistikk",
  settings_stats_count: "Segmenter hoppet over",
  settings_stats_time: "Tid spart",
  settings_stats_reset: "Tilbakestill statistikk",
  settings_saved: "Lagret",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Hoppet over",
  notice_undo: "Angre",
  notice_close: "Lukk",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "t",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Segmentdata fra SponsorBlock (sponsor.ajay.app), lisensiert under CC BY-NC-SA 4.0.",
  not_affiliated: "Dette er en gratis, ikke-kommersiell klient som bare leser data, og den er ikke tilknyttet, godkjent av eller laget av SponsorBlock eller YouTube / Google.",
  privacy_note: "Bare en hash på 4 tegn av video-ID-en sendes til SponsorBlock for å slå opp segmenter. Vi driver ingen servere, ingen analyse og ingen sporing. Innstillingene dine lagres av Chrome og synkroniseres, hvis du har slått på Chrome Sync, på tvers av nettleserne du er logget inn på; statistikk og kanalhvitelisten forblir på denne enheten."
};
