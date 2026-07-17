/**
 * shared/messages/es.js — Spanish UI strings (mirrors the key set of en.js, the
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
  cat_sponsor: "Patrocinador",
  cat_selfpromo: "Autopromoción",
  cat_interaction: "Recordatorios (me gusta / suscripción)",
  cat_intro: "Intro / intermedio",
  cat_outro: "Cierre / tarjetas finales",
  cat_preview: "Avance / resumen",
  cat_filler: "Relleno / digresión",
  cat_music_offtopic: "Sección sin música",
  cat_hook: "Gancho / saludo",

  // Popup.
  popup_enabled: "Salto activado",
  popup_categories: "Saltar estos segmentos",
  popup_skipped: "Segmentos saltados",
  popup_time_saved: "Tiempo ahorrado",
  popup_open_settings: "Más ajustes",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Se saltará:",
  popup_status_off: "El salto está desactivado",
  popup_status_whitelisted: "Este canal está en la lista blanca",
  popup_status_none: "Aún no hay segmentos marcados",
  popup_status_too_short: "Los segmentos activos no llegan a tu duración mínima",
  popup_status_category_off: "Estas categorías de segmentos están desactivadas",
  popup_status_error: "No se pudieron cargar los datos de segmentos",
  popup_status_checking: "Comprobando…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Ajustes",
  tab_settings: "Ajustes",
  tab_statistics: "Estadísticas",
  settings_general: "General",
  settings_language: "Idioma",
  settings_enabled: "Activar el salto automático",
  settings_timeline_markers: "Mostrar marcas de segmentos en la barra de progreso",
  settings_skip_notice: "Mostrar un aviso de salto con botón de deshacer",
  settings_categories: "Categorías que saltar",
  settings_min_length: "Duración mínima del segmento (segundos)",
  settings_min_length_hint: "Los segmentos más cortos se ignoran. 0 = saltar todos.",
  settings_whitelist: "Lista blanca de canales",
  settings_whitelist_hint: "El salto se desactiva en estos canales. Añade un identificador de canal (p. ej. @channelname) o un id channel/UC...",
  settings_whitelist_add: "Añadir",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "No hay canales en la lista blanca.",
  settings_remove: "Quitar",
  settings_stats: "Estadísticas",
  settings_stats_count: "Segmentos saltados",
  settings_stats_time: "Tiempo ahorrado",
  settings_stats_reset: "Restablecer estadísticas",
  settings_saved: "Guardado",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Saltado",
  notice_undo: "Deshacer",
  notice_close: "Cerrar",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Datos de segmentos de SponsorBlock (sponsor.ajay.app), con licencia CC BY-NC-SA 4.0.",
  not_affiliated: "Este es un cliente gratuito, no comercial y de solo lectura; no está afiliado a SponsorBlock ni a YouTube / Google, no cuenta con su respaldo y no ha sido creado por ellos.",
  privacy_note: "A SponsorBlock solo se envía un hash de 4 caracteres del ID del vídeo para buscar los segmentos. No tenemos servidores, ni analíticas, ni seguimiento. Tus ajustes los almacena Chrome y, si tienes Chrome Sync activado, se sincronizan entre los navegadores en los que hayas iniciado sesión; las estadísticas y la lista blanca de canales permanecen en este dispositivo."
};
