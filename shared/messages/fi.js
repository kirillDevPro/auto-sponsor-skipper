/**
 * shared/messages/fi.js — Finnish UI strings (mirrors the en.js key set for the
 * in-page popup and options runtime). Every message table in this folder MUST
 * carry the identical key set; tests/i18n.test.mjs fails on drift.
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
  cat_sponsor: "Sponsori",
  cat_selfpromo: "Itsemainonta",
  cat_interaction: "Muistutukset (tykkää / tilaa)",
  cat_intro: "Intro / tauko",
  cat_outro: "Outro / lopetuskortit",
  cat_preview: "Esikatselu / kertaus",
  cat_filler: "Täyte / sivupolku",
  cat_music_offtopic: "Ei-musiikkiosuus",
  cat_hook: "Koukku / tervehdys",

  // Popup.
  popup_enabled: "Ohitus käytössä",
  popup_categories: "Ohita nämä osiot",
  popup_skipped: "Ohitetut osiot",
  popup_time_saved: "Säästetty aika",
  popup_open_settings: "Lisäasetukset",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Ohitetaan:",
  popup_status_off: "Ohitus on pois käytöstä",
  popup_status_whitelisted: "Tämä kanava on sallittujen listalla",
  popup_status_none: "Osioita ei ole vielä merkitty",
  popup_status_too_short: "Käytössä olevat osiot alittavat vähimmäispituuden",
  popup_status_category_off: "Näiden osioiden luokat ovat pois käytöstä",
  popup_status_error: "Osiotietojen lataus epäonnistui",
  popup_status_checking: "Tarkistetaan…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Asetukset",
  tab_settings: "Asetukset",
  tab_statistics: "Tilastot",
  settings_general: "Yleiset",
  settings_language: "Käyttöliittymän kieli",
  settings_enabled: "Ota automaattinen ohitus käyttöön",
  settings_timeline_markers: "Näytä osiomerkinnät edistymispalkissa",
  settings_skip_notice: "Näytä ohitusilmoitus ja kumoa-painike",
  settings_categories: "Ohitettavat luokat",
  settings_min_length: "Osion vähimmäispituus (sekuntia)",
  settings_min_length_hint: "Tätä lyhyemmät osiot jätetään huomiotta. 0 = ohita kaikki.",
  settings_whitelist: "Kanavien sallittujen lista",
  settings_whitelist_hint: "Ohitus on pois käytöstä näillä kanavilla. Lisää kanavan tunniste (esim. @channelname) tai channel/UC... -tunnus.",
  settings_whitelist_add: "Lisää",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Ei sallittuja kanavia.",
  settings_remove: "Poista",
  settings_stats: "Tilastot",
  settings_stats_count: "Ohitetut osiot",
  settings_stats_time: "Säästetty aika",
  settings_stats_reset: "Nollaa tilastot",
  settings_saved: "Tallennettu",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Ohitettu",
  notice_undo: "Kumoa",
  notice_close: "Sulje",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "t",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Osiotiedot: SponsorBlock (sponsor.ajay.app), lisenssi CC BY-NC-SA 4.0.",
  not_affiliated: "Tämä on ilmainen, ei-kaupallinen ja vain tietoja lukeva asiakasohjelma. Se ei ole sidoksissa SponsorBlockiin tai YouTubeen / Googleen, eivätkä nämä ole suositelleet tai luoneet sitä.",
  privacy_note: "SponsorBlockille lähetetään osioiden hakemista varten vain videon tunnuksesta muodostettu 4 merkin tiiviste. Emme ylläpidä palvelimia, analytiikkaa emmekä seurantaa. Chrome tallentaa asetuksesi, ja jos Chrome Sync on käytössä, ne synkronoidaan kirjautuneiden selaintesi välillä; tilastot ja kanavien sallittujen lista pysyvät tällä laitteella."
};
