/**
 * shared/messages/it.js — Italian UI strings for the in-page popup and options
 * runtime. Mirrors the key set of shared/messages/en.js exactly (the
 * source-of-truth locale); tests/i18n.test.mjs fails on drift.
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
  cat_selfpromo: "Autopromozione",
  cat_interaction: "Promemoria (mi piace / iscriviti)",
  cat_intro: "Intro / intervallo",
  cat_outro: "Outro / schede finali",
  cat_preview: "Anteprima / riepilogo",
  cat_filler: "Riempitivo / divagazione",
  cat_music_offtopic: "Sezione non musicale",
  cat_hook: "Hook / saluto",

  // Popup.
  popup_enabled: "Salto attivo",
  popup_categories: "Segmenti da saltare",
  popup_skipped: "Segmenti saltati",
  popup_time_saved: "Tempo risparmiato",
  popup_open_settings: "Altre impostazioni",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Verrà saltato:",
  popup_status_off: "Il salto è disattivato",
  popup_status_whitelisted: "Questo canale è nella lista bianca",
  popup_status_none: "Nessun segmento ancora segnalato",
  popup_status_too_short: "I segmenti attivi sono sotto la durata minima",
  popup_status_category_off: "Queste categorie di segmenti sono disattivate",
  popup_status_error: "Impossibile caricare i dati dei segmenti",
  popup_status_checking: "Controllo…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Impostazioni",
  tab_settings: "Impostazioni",
  tab_statistics: "Statistiche",
  settings_general: "Generale",
  settings_language: "Lingua",
  settings_enabled: "Attiva il salto automatico",
  settings_timeline_markers: "Mostra i marcatori dei segmenti sulla barra di avanzamento",
  settings_skip_notice: "Mostra un avviso di salto con il pulsante Annulla",
  settings_categories: "Categorie da saltare",
  settings_min_length: "Durata minima del segmento (secondi)",
  settings_min_length_hint: "I segmenti più brevi vengono ignorati. 0 = salta tutti.",
  settings_whitelist: "Lista bianca dei canali",
  settings_whitelist_hint: "Il salto è disattivato su questi canali. Aggiungi l'handle di un canale (es. @channelname) o un id channel/UC...",
  settings_whitelist_add: "Aggiungi",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Nessun canale nella lista bianca.",
  settings_remove: "Rimuovi",
  settings_stats: "Statistiche",
  settings_stats_count: "Segmenti saltati",
  settings_stats_time: "Tempo risparmiato",
  settings_stats_reset: "Reimposta statistiche",
  settings_saved: "Salvato",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Saltato",
  notice_undo: "Annulla",
  notice_close: "Chiudi",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Dati dei segmenti forniti da SponsorBlock (sponsor.ajay.app), con licenza CC BY-NC-SA 4.0.",
  not_affiliated: "Questo è un client gratuito, non commerciale e di sola lettura, non affiliato a SponsorBlock o YouTube / Google, non approvato né creato da loro.",
  privacy_note: "A SponsorBlock viene inviato solo un hash di 4 caratteri dell'ID del video per cercare i segmenti. Non gestiamo alcun server, nessuna analisi e nessun tracciamento. Le tue impostazioni vengono memorizzate da Chrome e, se hai attivato Chrome Sync, sincronizzate tra i browser in cui hai effettuato l'accesso; le statistiche e la lista bianca dei canali restano su questo dispositivo."
};
