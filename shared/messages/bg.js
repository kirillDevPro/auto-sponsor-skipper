/**
 * shared/messages/bg.js — Bulgarian UI strings (mirrors the key set of
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
  cat_sponsor: "Спонсор",
  cat_selfpromo: "Самореклама",
  cat_interaction: "Напомняния (харесване / абонамент)",
  cat_intro: "Интро / пауза",
  cat_outro: "Аутро / финални карти",
  cat_preview: "Анонс / резюме",
  cat_filler: "Пълнеж / отклонение",
  cat_music_offtopic: "Немузикална част",
  cat_hook: "Тийзър / поздрав",

  // Popup.
  popup_enabled: "Прескачането е включено",
  popup_categories: "Прескачай тези сегменти",
  popup_skipped: "Прескочени сегменти",
  popup_time_saved: "Спестено време",
  popup_open_settings: "Още настройки",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Ще прескочи:",
  popup_status_off: "Прескачането е изключено",
  popup_status_whitelisted: "Този канал е в белия списък",
  popup_status_none: "Още няма маркирани сегменти",
  popup_status_too_short: "Включените сегменти са под минималната ви дължина",
  popup_status_category_off: "Тези категории сегменти са изключени",
  popup_status_error: "Данните за сегментите не се заредиха",
  popup_status_checking: "Проверка…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Настройки",
  tab_settings: "Настройки",
  tab_statistics: "Статистики",
  settings_general: "Общи",
  settings_language: "Език",
  settings_enabled: "Включване на автоматичното прескачане",
  settings_timeline_markers: "Показвай маркери на сегментите върху лентата за напредък",
  settings_skip_notice: "Показвай известие за прескачане с бутон за отмяна",
  settings_categories: "Категории за прескачане",
  settings_min_length: "Минимална дължина на сегмент (секунди)",
  settings_min_length_hint: "Сегментите, по-къси от това, се пренебрегват. 0 = прескачай всички.",
  settings_whitelist: "Бял списък с канали",
  settings_whitelist_hint: "Прескачането е изключено в тези канали. Добавете хендъл на канал (напр. @channelname) или ид. channel/UC...",
  settings_whitelist_add: "Добави",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Няма канали в белия списък.",
  settings_remove: "Премахни",
  settings_stats: "Статистики",
  settings_stats_count: "Прескочени сегменти",
  settings_stats_time: "Спестено време",
  settings_stats_reset: "Нулиране на статистиките",
  settings_saved: "Запазено",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Прескочено",
  notice_undo: "Отмени",
  notice_close: "Затвори",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "ч",
  duration_minute_short: "мин",
  duration_second_short: "с",

  // About / legal.
  attribution: "Данните за сегментите са предоставени от SponsorBlock (sponsor.ajay.app), лицензирани под CC BY-NC-SA 4.0.",
  not_affiliated: "Това е безплатен, некомерсиален клиент само за четене и не е свързан с, одобрен от или създаден от SponsorBlock или YouTube / Google.",
  privacy_note: "До SponsorBlock се изпраща само 4-знаков хеш на идентификатора на видеото, за да бъдат намерени сегментите. Не поддържаме сървъри, не използваме анализи и не извършваме проследяване. Настройките ви се съхраняват от Chrome и, ако сте включили Chrome Sync, се синхронизират между браузърите, в които сте влезли; статистиките и белият списък с канали остават на това устройство."
};
