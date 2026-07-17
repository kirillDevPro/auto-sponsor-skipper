/**
 * shared/messages/da.js — Danish UI strings for the in-page popup and options
 * runtime. This table mirrors the key set of en.js exactly (same keys, same
 * order); tests/i18n.test.mjs fails on drift.
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
  cat_selfpromo: "Selvpromovering",
  cat_interaction: "Påmindelser (like / abonner)",
  cat_intro: "Intro / pause",
  cat_outro: "Outro / slutkort",
  cat_preview: "Forhåndsvisning / opsummering",
  cat_filler: "Fyld / sidespring",
  cat_music_offtopic: "Ikke-musikafsnit",
  cat_hook: "Hook / velkomst",

  // Popup.
  popup_enabled: "Overspringning aktiveret",
  popup_categories: "Spring disse segmenter over",
  popup_skipped: "Segmenter sprunget over",
  popup_time_saved: "Tid sparet",
  popup_open_settings: "Flere indstillinger",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Springer over:",
  popup_status_off: "Overspringning er slået fra",
  popup_status_whitelisted: "Denne kanal er på hvidlisten",
  popup_status_none: "Ingen segmenter markeret endnu",
  popup_status_too_short: "Aktiverede segmenter er under din minimumslængde",
  popup_status_category_off: "Disse segmentkategorier er slået fra",
  popup_status_error: "Kunne ikke indlæse segmentdata",
  popup_status_checking: "Tjekker…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Indstillinger",
  tab_settings: "Indstillinger",
  tab_statistics: "Statistikker",
  settings_general: "Generelt",
  settings_language: "Grænsefladesprog",
  settings_enabled: "Aktivér automatisk overspringning",
  settings_timeline_markers: "Vis segmentmarkører på statuslinjen",
  settings_skip_notice: "Vis en meddelelse om overspringning med fortryd-knap",
  settings_categories: "Kategorier der skal springes over",
  settings_min_length: "Minimumslængde for segmenter (sekunder)",
  settings_min_length_hint: "Segmenter kortere end dette ignoreres. 0 = spring alle over.",
  settings_whitelist: "Kanalhvidliste",
  settings_whitelist_hint: "Overspringning er deaktiveret på disse kanaler. Tilføj et kanalhandle (f.eks. @channelname) eller et channel/UC...-id.",
  settings_whitelist_add: "Tilføj",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Ingen kanaler på hvidlisten.",
  settings_remove: "Fjern",
  settings_stats: "Statistikker",
  settings_stats_count: "Segmenter sprunget over",
  settings_stats_time: "Tid sparet",
  settings_stats_reset: "Nulstil statistikker",
  settings_saved: "Gemt",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Sprunget over",
  notice_undo: "Fortryd",
  notice_close: "Luk",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "t",
  duration_minute_short: "m",
  duration_second_short: "s",

  // About / legal.
  attribution: "Segmentdata leveres af SponsorBlock (sponsor.ajay.app), licenseret under CC BY-NC-SA 4.0.",
  not_affiliated: "Dette er en gratis, ikke-kommerciel klient med skrivebeskyttet adgang, og den er ikke tilknyttet, godkendt af eller skabt af SponsorBlock eller YouTube / Google.",
  privacy_note: "Kun en hash på 4 tegn af video-id'et sendes til SponsorBlock for at slå segmenter op. Vi driver ingen servere, ingen analyse og ingen sporing. Dine indstillinger gemmes af Chrome og synkroniseres, hvis du har slået Chrome Sync til, på tværs af de browsere, du er logget ind på; statistik og kanalhvidlisten forbliver på denne enhed."
};
