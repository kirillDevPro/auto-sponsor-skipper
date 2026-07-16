/**
 * shared/messages/uk.js — Ukrainian UI strings. Mirrors the key set of
 * shared/messages/en.js exactly (guarded by tests/i18n.test.mjs). `extName` is a
 * brand name — kept byte-identical to en.js, never translated.
 */

export default {
  extName: "Auto Sponsor Skipper",

  cat_sponsor: "Спонсор",
  cat_selfpromo: "Самореклама",
  cat_interaction: "Нагадування (лайк / підписка)",
  cat_intro: "Заставка / вступ",
  cat_outro: "Кінцівка / кінцеві заставки",
  cat_preview: "Прев'ю / короткий огляд",
  cat_filler: "Вода / відступ від теми",
  cat_music_offtopic: "Немузичний фрагмент",
  cat_hook: "Гачок / вітання",

  popup_enabled: "Пропуск увімкнено",
  popup_categories: "Пропускати ці сегменти",
  popup_skipped: "Сегментів пропущено",
  popup_time_saved: "Заощаджено",
  popup_open_settings: "Більше налаштувань",

  popup_status_will_skip: "Буде пропущено:",
  popup_status_off: "Пропуск вимкнено",
  popup_status_whitelisted: "Канал у білому списку",
  popup_status_none: "Сегментів ще не розмічено",
  popup_status_too_short: "Увімкнені сегменти коротші за мінімальну довжину",
  popup_status_category_off: "Ці категорії сегментів вимкнено",
  popup_status_error: "Не вдалося завантажити дані",
  popup_status_checking: "Перевірка…",

  settings_title: "Auto Sponsor Skipper — Налаштування",
  tab_settings: "Налаштування",
  tab_statistics: "Статистика",
  settings_general: "Загальні",
  settings_language: "Мова",
  settings_enabled: "Увімкнути автопропуск",
  settings_timeline_markers: "Показувати позначки сегментів на смузі прогресу",
  settings_skip_notice: "Показувати сповіщення про пропуск із кнопкою скасування",
  settings_categories: "Категорії для пропуску",
  settings_min_length: "Мінімальна довжина сегмента (секунди)",
  settings_min_length_hint: "Сегменти, коротші за це значення, ігноруються. 0 = пропускати всі.",
  settings_whitelist: "Білий список каналів",
  settings_whitelist_hint: "На цих каналах пропуск вимкнено. Додайте хендл каналу (наприклад, @channelname) або ідентифікатор у форматі channel/UC...",
  settings_whitelist_add: "Додати",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Немає каналів у білому списку.",
  settings_remove: "Видалити",
  settings_stats: "Статистика",
  settings_stats_count: "Сегментів пропущено",
  settings_stats_time: "Заощаджено часу",
  settings_stats_reset: "Скинути статистику",
  settings_saved: "Збережено",

  notice_skipped: "Пропущено",
  notice_undo: "Скасувати",
  notice_close: "Закрити",

  duration_hour_short: "год",
  duration_minute_short: "хв",
  duration_second_short: "с",

  attribution: "Дані сегментів надано SponsorBlock (sponsor.ajay.app), ліцензія CC BY-NC-SA 4.0.",
  not_affiliated: "Це безкоштовний некомерційний клієнт лише для читання; він не пов'язаний зі SponsorBlock або YouTube / Google, не схвалений і не створений ними.",
  privacy_note: "Для пошуку сегментів у SponsorBlock надсилається лише 4-символьний хеш ідентифікатора відео. У нас немає серверів, аналітики та відстеження. Ваші налаштування зберігаються в Chrome і, якщо ввімкнено синхронізацію Chrome, синхронізуються між браузерами, у які ви ввійшли; статистика та білий список каналів залишаються на цьому пристрої."
};
