/**
 * shared/messages/sk.js — Slovak UI strings for the in-page popup and options
 * runtime. Mirrors the key set of shared/messages/en.js exactly (same keys, same
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
  cat_sponsor: "Sponzor",
  cat_selfpromo: "Vlastná propagácia",
  cat_interaction: "Výzvy (lajk / odber)",
  cat_intro: "Intro / prestávka",
  cat_outro: "Outro / záverečné karty",
  cat_preview: "Ukážka / zhrnutie",
  cat_filler: "Výplň / odbočka",
  cat_music_offtopic: "Nehudobná časť",
  cat_hook: "Návnada / pozdrav",

  // Popup.
  popup_enabled: "Preskakovanie zapnuté",
  popup_categories: "Preskakovať tieto segmenty",
  popup_skipped: "Preskočené segmenty",
  popup_time_saved: "Ušetrený čas",
  popup_open_settings: "Ďalšie nastavenia",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Preskočí sa:",
  popup_status_off: "Preskakovanie je vypnuté",
  popup_status_whitelisted: "Tento kanál je na bielej listine",
  popup_status_none: "Zatiaľ nie sú označené žiadne segmenty",
  popup_status_too_short: "Zapnuté segmenty sú kratšie než vaša minimálna dĺžka",
  popup_status_category_off: "Tieto kategórie segmentov sú vypnuté",
  popup_status_error: "Údaje o segmentoch sa nepodarilo načítať",
  popup_status_checking: "Kontroluje sa…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Nastavenia",
  tab_settings: "Nastavenia",
  tab_statistics: "Štatistiky",
  settings_general: "Všeobecné",
  settings_language: "Jazyk rozhrania",
  settings_enabled: "Zapnúť automatické preskakovanie",
  settings_timeline_markers: "Zobrazovať značky segmentov na paneli priebehu",
  settings_skip_notice: "Zobrazovať oznámenie o preskočení s tlačidlom Späť",
  settings_categories: "Kategórie na preskakovanie",
  settings_min_length: "Minimálna dĺžka segmentu (sekundy)",
  settings_min_length_hint: "Kratšie segmenty sa ignorujú. 0 = preskakovať všetky.",
  settings_whitelist: "Biela listina kanálov",
  settings_whitelist_hint: "Na týchto kanáloch je preskakovanie vypnuté. Pridajte názov kanála (napr. @channelname) alebo id v tvare channel/UC...",
  settings_whitelist_add: "Pridať",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Žiadne kanály na bielej listine.",
  settings_remove: "Odstrániť",
  settings_stats: "Štatistiky",
  settings_stats_count: "Preskočené segmenty",
  settings_stats_time: "Ušetrený čas",
  settings_stats_reset: "Obnoviť štatistiky",
  settings_saved: "Uložené",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Preskočené",
  notice_undo: "Späť",
  notice_close: "Zavrieť",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Údaje o segmentoch poskytuje SponsorBlock (sponsor.ajay.app), licencia CC BY-NC-SA 4.0.",
  not_affiliated: "Toto je bezplatný, nekomerčný klient určený len na čítanie a nie je pridružený k SponsorBlock ani YouTube / Google, nie je nimi schválený ani vytvorený.",
  privacy_note: "Na vyhľadanie segmentov sa do SponsorBlock odosiela iba 4-znakový hash ID videa. Neprevádzkujeme žiadne servery, žiadnu analytiku a žiadne sledovanie. Vaše nastavenia ukladá Chrome a ak máte zapnutý Chrome Sync, synchronizujú sa medzi vašimi prihlásenými prehliadačmi; štatistiky a biela listina kanálov zostávajú v tomto zariadení."
};
