/**
 * shared/messages/fa.js — Persian (Farsi) UI strings for the in-page popup and
 * options runtime. Every message table in this folder MUST carry the identical
 * key set as en.js; tests/i18n.test.mjs fails on drift.
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
  cat_sponsor: "اسپانسر",
  cat_selfpromo: "تبلیغ شخصی",
  cat_interaction: "یادآوری (لایک / سابسکرایب)",
  cat_intro: "مقدمه / وقفه",
  cat_outro: "پایان / کارت‌های پایانی",
  cat_preview: "پیش‌نمایش / خلاصه",
  cat_filler: "پرکننده / حاشیه",
  cat_music_offtopic: "بخش غیرموسیقی",
  cat_hook: "تیزر / خوش‌آمدگویی",

  // Popup.
  popup_enabled: "رد کردن فعال است",
  popup_categories: "این بخش‌ها رد شوند",
  popup_skipped: "بخش‌های رد شده",
  popup_time_saved: "زمان ذخیره‌شده",
  popup_open_settings: "تنظیمات بیشتر",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "رد می‌شود:",
  popup_status_off: "رد کردن خاموش است",
  popup_status_whitelisted: "این کانال در فهرست سفید است",
  popup_status_none: "هنوز بخشی علامت‌گذاری نشده است",
  popup_status_too_short: "بخش‌های فعال کوتاه‌تر از حداقل طول شما هستند",
  popup_status_category_off: "این دسته‌های بخش خاموش هستند",
  popup_status_error: "بارگیری داده‌های بخش‌ها ممکن نشد",
  popup_status_checking: "در حال بررسی…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — تنظیمات",
  tab_settings: "تنظیمات",
  tab_statistics: "آمار",
  settings_general: "عمومی",
  settings_language: "زبان رابط",
  settings_enabled: "فعال کردن رد کردن خودکار",
  settings_timeline_markers: "نمایش نشانگر بخش‌ها روی نوار پیشرفت",
  settings_skip_notice: "نمایش اعلان رد کردن همراه با دکمه بازگردانی",
  settings_categories: "دسته‌های قابل رد کردن",
  settings_min_length: "حداقل طول بخش (ثانیه)",
  settings_min_length_hint: "بخش‌های کوتاه‌تر از این نادیده گرفته می‌شوند. 0 = رد کردن همه.",
  settings_whitelist: "فهرست سفید کانال‌ها",
  settings_whitelist_hint: "رد کردن در این کانال‌ها غیرفعال است. یک شناسه کانال (مثلاً @channelname) یا شناسه channel/UC... اضافه کنید.",
  settings_whitelist_add: "افزودن",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "هیچ کانالی در فهرست سفید نیست.",
  settings_remove: "حذف",
  settings_stats: "آمار",
  settings_stats_count: "بخش‌های رد شده",
  settings_stats_time: "زمان ذخیره‌شده",
  settings_stats_reset: "بازنشانی آمار",
  settings_saved: "ذخیره شد",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "رد شد",
  notice_undo: "بازگردانی",
  notice_close: "بستن",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "س",
  duration_minute_short: "د",
  duration_second_short: "ث",

  // About / legal.
  attribution: "داده‌های بخش‌ها از SponsorBlock (sponsor.ajay.app)، با مجوز CC BY-NC-SA 4.0.",
  not_affiliated: "این یک کلاینت رایگان، غیرتجاری و فقط‌خواندنی است و هیچ وابستگی یا تأییدیه‌ای از سوی SponsorBlock یا YouTube / Google ندارد و توسط آن‌ها ساخته نشده است.",
  privacy_note: "فقط یک هش ۴ کاراکتری از شناسه ویدیو برای یافتن بخش‌ها به SponsorBlock ارسال می‌شود. ما هیچ سروری، هیچ تحلیل آماری و هیچ ردیابی‌ای نداریم. تنظیمات شما توسط Chrome ذخیره می‌شود و اگر Chrome Sync را روشن کرده باشید، بین مرورگرهایی که در آن‌ها وارد حساب شده‌اید همگام‌سازی می‌شود؛ آمار و فهرست سفید کانال‌ها روی همین دستگاه باقی می‌مانند."
};
