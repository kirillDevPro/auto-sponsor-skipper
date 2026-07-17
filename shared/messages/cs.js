/**
 * shared/messages/cs.js — Czech UI strings (mirrors the key set of en.js, the
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
  cat_sponsor: "Sponzor",
  cat_selfpromo: "Vlastní propagace",
  cat_interaction: "Připomínky (like / odběr)",
  cat_intro: "Intro / mezihra",
  cat_outro: "Outro / koncové karty",
  cat_preview: "Ukázka / rekapitulace",
  cat_filler: "Výplň / odbočka",
  cat_music_offtopic: "Nehudební část",
  cat_hook: "Upoutávka / pozdrav",

  // Popup.
  popup_enabled: "Přeskakování zapnuto",
  popup_categories: "Přeskakovat tyto segmenty",
  popup_skipped: "Přeskočené segmenty",
  popup_time_saved: "Ušetřený čas",
  popup_open_settings: "Další nastavení",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Přeskočí se:",
  popup_status_off: "Přeskakování je vypnuté",
  popup_status_whitelisted: "Tento kanál je na seznamu výjimek",
  popup_status_none: "Zatím nejsou označené žádné segmenty",
  popup_status_too_short: "Povolené segmenty jsou kratší než vaše minimální délka",
  popup_status_category_off: "Tyto kategorie segmentů jsou vypnuté",
  popup_status_error: "Data o segmentech se nepodařilo načíst",
  popup_status_checking: "Kontroluji…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Nastavení",
  tab_settings: "Nastavení",
  tab_statistics: "Statistiky",
  settings_general: "Obecné",
  settings_language: "Jazyk rozhraní",
  settings_enabled: "Zapnout automatické přeskakování",
  settings_timeline_markers: "Zobrazovat značky segmentů na ukazateli průběhu",
  settings_skip_notice: "Zobrazovat oznámení o přeskočení s tlačítkem Zpět",
  settings_categories: "Kategorie k přeskočení",
  settings_min_length: "Minimální délka segmentu (sekundy)",
  settings_min_length_hint: "Kratší segmenty se ignorují. 0 = přeskakovat vše.",
  settings_whitelist: "Seznam výjimek kanálů",
  settings_whitelist_hint: "Na těchto kanálech je přeskakování vypnuté. Přidejte jméno kanálu (např. @channelname) nebo id ve tvaru channel/UC...",
  settings_whitelist_add: "Přidat",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Žádné kanály na seznamu výjimek.",
  settings_remove: "Odebrat",
  settings_stats: "Statistiky",
  settings_stats_count: "Přeskočené segmenty",
  settings_stats_time: "Ušetřený čas",
  settings_stats_reset: "Resetovat statistiky",
  settings_saved: "Uloženo",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Přeskočeno",
  notice_undo: "Zpět",
  notice_close: "Zavřít",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Data o segmentech poskytuje SponsorBlock (sponsor.ajay.app), licencováno pod CC BY-NC-SA 4.0.",
  not_affiliated: "Toto je bezplatný, nekomerční klient pouze pro čtení a není nijak spojen se službami SponsorBlock ani YouTube / Google, není jimi podporován ani vytvořen.",
  privacy_note: "Službě SponsorBlock se pro vyhledání segmentů odesílá pouze 4znakový hash ID videa. Neprovozujeme žádné servery, žádnou analytiku ani žádné sledování. Vaše nastavení ukládá Chrome a pokud máte zapnutou funkci Chrome Sync, synchronizuje se mezi prohlížeči, ve kterých jste přihlášeni; statistiky a seznam výjimek kanálů zůstávají v tomto zařízení."
};
