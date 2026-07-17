/**
 * shared/messages/et.js — Estonian UI strings (mirrors the key set of
 * shared/messages/en.js, the source-of-truth locale for the in-page popup and
 * options runtime). Every message table in this folder MUST carry the identical
 * key set; tests/i18n.test.mjs fails on drift.
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
  cat_selfpromo: "Enesereklaam",
  cat_interaction: "Meeldetuletused (meeldib / telli)",
  cat_intro: "Intro / vahepala",
  cat_outro: "Lõputiitrid / lõpukaardid",
  cat_preview: "Eelvaade / kokkuvõte",
  cat_filler: "Täitesisu / kõrvalepõige",
  cat_music_offtopic: "Muusikavaba osa",
  cat_hook: "Peibutus / tervitus",

  // Popup.
  popup_enabled: "Vahelejätmine lubatud",
  popup_categories: "Jäta need lõigud vahele",
  popup_skipped: "Vahelejäetud lõike",
  popup_time_saved: "Säästetud aeg",
  popup_open_settings: "Rohkem seadeid",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Jäetakse vahele:",
  popup_status_off: "Vahelejätmine on välja lülitatud",
  popup_status_whitelisted: "See kanal on lubatud loendis",
  popup_status_none: "Ühtegi lõiku pole veel märgitud",
  popup_status_too_short: "Lubatud lõigud on lühemad kui määratud vähim pikkus",
  popup_status_category_off: "Need lõigukategooriad on välja lülitatud",
  popup_status_error: "Lõikude andmeid ei õnnestunud laadida",
  popup_status_checking: "Kontrollin…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Seaded",
  tab_settings: "Seaded",
  tab_statistics: "Statistika",
  settings_general: "Üldine",
  settings_language: "Liidese keel",
  settings_enabled: "Luba automaatne vahelejätmine",
  settings_timeline_markers: "Näita lõikude märgiseid edenemisribal",
  settings_skip_notice: "Näita vahelejätmise teadet koos tagasivõtmise nupuga",
  settings_categories: "Vahelejäetavad kategooriad",
  settings_min_length: "Lõigu vähim pikkus (sekundites)",
  settings_min_length_hint: "Sellest lühemaid lõike eiratakse. 0 = jäta kõik vahele.",
  settings_whitelist: "Kanalite lubatud loend",
  settings_whitelist_hint: "Nendel kanalitel on vahelejätmine välja lülitatud. Lisa kanali tunnus (nt @channelname) või channel/UC... id.",
  settings_whitelist_add: "Lisa",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Lubatud loendis pole ühtegi kanalit.",
  settings_remove: "Eemalda",
  settings_stats: "Statistika",
  settings_stats_count: "Vahelejäetud lõike",
  settings_stats_time: "Säästetud aeg",
  settings_stats_reset: "Lähtesta statistika",
  settings_saved: "Salvestatud",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Vahele jäetud",
  notice_undo: "Võta tagasi",
  notice_close: "Sulge",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "t",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Lõikude andmed pärinevad SponsorBlockilt (sponsor.ajay.app), litsentsiga CC BY-NC-SA 4.0.",
  not_affiliated: "See on tasuta, mitteäriline ja ainult lugemisõigusega klient ning see ei ole seotud SponsorBlocki ega YouTube'i / Google'iga, need ei toeta seda ega ole seda loonud.",
  privacy_note: "SponsorBlockile saadetakse lõikude otsimiseks ainult video ID 4-märgiline räsi. Me ei pea ühtegi serverit, ei kogu analüütikat ega jälgi kasutajaid. Sinu seaded salvestab Chrome ja kui Chrome Sync on sisse lülitatud, sünkroonitakse need sinu sisselogitud brauserite vahel; statistika ja kanalite lubatud loend jäävad sellesse seadmesse."
};
