/**
 * shared/messages/ar.js — Arabic UI strings (mirrors the en.js key set for the
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
  cat_sponsor: "رعاية",
  cat_selfpromo: "ترويج ذاتي",
  cat_interaction: "تذكير (إعجاب / اشتراك)",
  cat_intro: "مقدمة / فاصل",
  cat_outro: "خاتمة / بطاقات النهاية",
  cat_preview: "معاينة / ملخص",
  cat_filler: "حشو / استطراد",
  cat_music_offtopic: "قسم غير موسيقي",
  cat_hook: "تشويق / ترحيب",

  // Popup.
  popup_enabled: "التخطي مفعّل",
  popup_categories: "تخطَّ هذه المقاطع",
  popup_skipped: "المقاطع المتخطاة",
  popup_time_saved: "الوقت الموفَّر",
  popup_open_settings: "مزيد من الإعدادات",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "سيتم تخطي:",
  popup_status_off: "التخطي متوقف",
  popup_status_whitelisted: "هذه القناة في القائمة البيضاء",
  popup_status_none: "لا توجد مقاطع محددة بعد",
  popup_status_too_short: "المقاطع المفعّلة أقصر من الحد الأدنى للمدة",
  popup_status_category_off: "فئات هذه المقاطع متوقفة",
  popup_status_error: "تعذّر تحميل بيانات المقاطع",
  popup_status_checking: "جارٍ التحقق…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — الإعدادات",
  tab_settings: "الإعدادات",
  tab_statistics: "الإحصائيات",
  settings_general: "عام",
  settings_language: "لغة الواجهة",
  settings_enabled: "تفعيل التخطي التلقائي",
  settings_timeline_markers: "إظهار علامات المقاطع على شريط التقدم",
  settings_skip_notice: "إظهار إشعار تخطٍّ مع زر تراجع",
  settings_categories: "الفئات المراد تخطيها",
  settings_min_length: "الحد الأدنى لمدة المقطع (بالثواني)",
  settings_min_length_hint: "يتم تجاهل المقاطع الأقصر من ذلك. 0 = تخطي الكل.",
  settings_whitelist: "القائمة البيضاء للقنوات",
  settings_whitelist_hint: "التخطي معطّل في هذه القنوات. أضف معرّف قناة (مثل @channelname) أو معرّف channel/UC...",
  settings_whitelist_add: "إضافة",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "لا توجد قنوات في القائمة البيضاء.",
  settings_remove: "إزالة",
  settings_stats: "الإحصائيات",
  settings_stats_count: "المقاطع المتخطاة",
  settings_stats_time: "الوقت الموفَّر",
  settings_stats_reset: "إعادة تعيين الإحصائيات",
  settings_saved: "تم الحفظ",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "تم التخطي",
  notice_undo: "تراجع",
  notice_close: "إغلاق",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "س",
  duration_minute_short: "د",
  duration_second_short: "ث",

  // About / legal.
  attribution: "بيانات المقاطع من SponsorBlock (sponsor.ajay.app)، مرخّصة بموجب CC BY-NC-SA 4.0.",
  not_affiliated: "هذا عميل مجاني وغير تجاري وللقراءة فقط، وليس تابعًا لـ SponsorBlock أو YouTube / Google ولا معتمدًا منها ولا من إنشائها.",
  privacy_note: "يُرسَل إلى SponsorBlock فقط تجزئة مكوّنة من 4 أحرف لمعرّف الفيديو للبحث عن المقاطع. نحن لا نشغّل أي خوادم ولا تحليلات ولا تتبّع. تُخزَّن إعداداتك بواسطة Chrome، وإذا كانت مزامنة Chrome Sync مفعّلة لديك فتتم مزامنتها عبر متصفحاتك المسجّل دخولك فيها؛ أما الإحصائيات والقائمة البيضاء للقنوات فتبقى على هذا الجهاز."
};
