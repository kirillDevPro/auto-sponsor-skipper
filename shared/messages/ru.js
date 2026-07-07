/**
 * shared/messages/ru.js — Russian UI strings. Mirrors the key set of
 * shared/messages/en.js exactly (guarded by tests/i18n.test.mjs). `extName` is a
 * brand name — kept byte-identical to en.js, never translated.
 */

export default {
  extName: "Auto Sponsor Skipper",

  cat_sponsor: "Спонсор",
  cat_selfpromo: "Самореклама",
  cat_interaction: "Напоминания (лайк / подписка)",
  cat_intro: "Заставка / вступление",
  cat_outro: "Концовка / конечные заставки",
  cat_preview: "Превью / краткий обзор",
  cat_filler: "Вода / отступление",
  cat_music_offtopic: "Немузыкальный фрагмент",

  popup_enabled: "Пропуск включён",
  popup_categories: "Пропускать эти сегменты",
  popup_skipped: "Сегментов пропущено",
  popup_time_saved: "Сэкономлено",
  popup_open_settings: "Больше настроек",

  settings_title: "Auto Sponsor Skipper — Настройки",
  tab_settings: "Настройки",
  tab_statistics: "Статистика",
  settings_general: "Основные",
  settings_language: "Язык",
  settings_enabled: "Включить автопропуск",
  settings_timeline_markers: "Показывать метки сегментов на полосе прогресса",
  settings_categories: "Категории для пропуска",
  settings_min_length: "Минимальная длина сегмента (секунды)",
  settings_min_length_hint: "Сегменты короче этого значения игнорируются. 0 = пропускать все.",
  settings_whitelist: "Белый список каналов",
  settings_whitelist_hint: "На этих каналах пропуск отключён. Добавьте хендл канала (например, @channelname) или ID в формате channel/UC...",
  settings_whitelist_add: "Добавить",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Нет каналов в белом списке.",
  settings_remove: "Удалить",
  settings_stats: "Статистика",
  settings_stats_count: "Сегментов пропущено",
  settings_stats_time: "Сэкономлено времени",
  settings_stats_reset: "Сбросить статистику",
  settings_saved: "Сохранено",

  duration_hour_short: "ч",
  duration_minute_short: "мин",
  duration_second_short: "с",

  attribution: "Данные сегментов предоставлены SponsorBlock (sponsor.ajay.app), лицензия CC BY-NC-SA 4.0.",
  not_affiliated: "Это бесплатный некоммерческий клиент только для чтения; он не связан со SponsorBlock или YouTube / Google, не одобрен и не создан ими.",
  privacy_note: "Для поиска сегментов в SponsorBlock отправляется только 4-символьный хэш идентификатора видео. У нас нет серверов, аналитики и отслеживания. Ваши настройки хранятся в Chrome и, если включена синхронизация Chrome, синхронизируются между браузерами, в которые вы вошли; статистика и белый список каналов остаются на этом устройстве."
};
