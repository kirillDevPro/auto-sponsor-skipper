/**
 * shared/messages/pt_PT.js — European Portuguese UI strings for the in-page
 * popup and options runtime. This table MUST mirror the key set of
 * shared/messages/en.js exactly; tests/i18n.test.mjs fails on drift.
 *
 * These are the IN-PAGE strings only. The manifest name/description live
 * separately in _locales/ (native chrome.i18n, browser-locale for the Chrome
 * Web Store listing). `extName` is intentionally in BOTH places: the popup <h1>
 * localizes it in-page, the manifest localizes it for chrome://extensions.
 * `extName` is a brand name — keep it byte-identical across every locale
 * (never translate it).
 */

export default {
  extName: "Auto Sponsor Skipper",

  // SponsorBlock skip categories (keys match CATEGORIES[].i18nKey).
  cat_sponsor: "Patrocínio",
  cat_selfpromo: "Autopromoção",
  cat_interaction: "Lembretes (gosto / subscrever)",
  cat_intro: "Introdução / intervalo",
  cat_outro: "Final / cartões finais",
  cat_preview: "Antevisão / resumo",
  cat_filler: "Enchimento / divagação",
  cat_music_offtopic: "Secção sem música",
  cat_hook: "Gancho / saudação",

  // Popup.
  popup_enabled: "Salto ativado",
  popup_categories: "Saltar estes segmentos",
  popup_skipped: "Segmentos saltados",
  popup_time_saved: "Tempo poupado",
  popup_open_settings: "Mais definições",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Vai saltar:",
  popup_status_off: "O salto está desativado",
  popup_status_whitelisted: "Este canal está na lista de permissões",
  popup_status_none: "Ainda não há segmentos marcados",
  popup_status_too_short: "Os segmentos ativados estão abaixo da duração mínima",
  popup_status_category_off: "Estas categorias de segmentos estão desativadas",
  popup_status_error: "Não foi possível carregar os dados dos segmentos",
  popup_status_checking: "A verificar…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Definições",
  tab_settings: "Definições",
  tab_statistics: "Estatísticas",
  settings_general: "Geral",
  settings_language: "Idioma",
  settings_enabled: "Ativar salto automático",
  settings_timeline_markers: "Mostrar marcas dos segmentos na barra de progresso",
  settings_skip_notice: "Mostrar aviso de salto com botão para anular",
  settings_categories: "Categorias a saltar",
  settings_min_length: "Duração mínima do segmento (segundos)",
  settings_min_length_hint: "Segmentos mais curtos do que isto são ignorados. 0 = saltar todos.",
  settings_whitelist: "Lista de permissões de canais",
  settings_whitelist_hint: "O salto fica desativado nestes canais. Adicione o identificador de um canal (por exemplo, @channelname) ou um id channel/UC...",
  settings_whitelist_add: "Adicionar",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Nenhum canal na lista de permissões.",
  settings_remove: "Remover",
  settings_stats: "Estatísticas",
  settings_stats_count: "Segmentos saltados",
  settings_stats_time: "Tempo poupado",
  settings_stats_reset: "Repor estatísticas",
  settings_saved: "Guardado",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Saltado",
  notice_undo: "Anular",
  notice_close: "Fechar",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Dados dos segmentos fornecidos pelo SponsorBlock (sponsor.ajay.app), licenciados sob CC BY-NC-SA 4.0.",
  not_affiliated: "Este é um cliente gratuito, não comercial e apenas de leitura, e não está associado, aprovado nem foi criado pelo SponsorBlock ou pelo YouTube / Google.",
  privacy_note: "Ao SponsorBlock é enviado apenas um hash de 4 caracteres do ID do vídeo para procurar os segmentos. Não temos servidores, análises nem rastreio. As suas definições são guardadas pelo Chrome e, se tiver o Chrome Sync ativado, sincronizadas entre os navegadores onde tem sessão iniciada; as estatísticas e a lista de permissões de canais ficam neste dispositivo."
};
