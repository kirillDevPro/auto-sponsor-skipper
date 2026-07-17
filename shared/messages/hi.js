/**
 * shared/messages/hi.js — Hindi UI strings for the in-page popup and options
 * runtime. This table MUST mirror the key set of en.js exactly (same keys, same
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
  cat_sponsor: "प्रायोजक",
  cat_selfpromo: "स्वयं-प्रचार",
  cat_interaction: "अनुस्मारक (लाइक / सब्सक्राइब)",
  cat_intro: "इंट्रो / मध्यांतर",
  cat_outro: "आउट्रो / एंडकार्ड",
  cat_preview: "झलक / सारांश",
  cat_filler: "फिलर / विषयांतर",
  cat_music_offtopic: "गैर-संगीत भाग",
  cat_hook: "हुक / अभिवादन",

  // Popup.
  popup_enabled: "स्किप करना चालू",
  popup_categories: "ये सेगमेंट स्किप करें",
  popup_skipped: "स्किप किए गए सेगमेंट",
  popup_time_saved: "बचाया गया समय",
  popup_open_settings: "और सेटिंग्स",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "स्किप होगा:",
  popup_status_off: "स्किप करना बंद है",
  popup_status_whitelisted: "यह चैनल व्हाइटलिस्ट में है",
  popup_status_none: "अभी कोई सेगमेंट चिह्नित नहीं है",
  popup_status_too_short: "चालू सेगमेंट आपकी न्यूनतम लंबाई से छोटे हैं",
  popup_status_category_off: "ये सेगमेंट श्रेणियाँ बंद हैं",
  popup_status_error: "सेगमेंट डेटा लोड नहीं हो सका",
  popup_status_checking: "जाँच हो रही है…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — सेटिंग्स",
  tab_settings: "सेटिंग्स",
  tab_statistics: "आंकड़े",
  settings_general: "सामान्य",
  settings_language: "इंटरफेस भाषा",
  settings_enabled: "स्वचालित स्किपिंग चालू करें",
  settings_timeline_markers: "प्रोग्रेस बार पर सेगमेंट मार्कर दिखाएँ",
  settings_skip_notice: "पूर्ववत बटन के साथ स्किप सूचना दिखाएँ",
  settings_categories: "स्किप करने योग्य श्रेणियाँ",
  settings_min_length: "न्यूनतम सेगमेंट लंबाई (सेकंड)",
  settings_min_length_hint: "इससे छोटे सेगमेंट अनदेखा किए जाते हैं। 0 = सभी स्किप करें।",
  settings_whitelist: "चैनल व्हाइटलिस्ट",
  settings_whitelist_hint: "इन चैनलों पर स्किप करना बंद रहता है। चैनल हैंडल (जैसे @channelname) या channel/UC... आईडी जोड़ें।",
  settings_whitelist_add: "जोड़ें",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "कोई चैनल व्हाइटलिस्ट में नहीं है।",
  settings_remove: "हटाएँ",
  settings_stats: "आंकड़े",
  settings_stats_count: "स्किप किए गए सेगमेंट",
  settings_stats_time: "बचाया गया समय",
  settings_stats_reset: "आंकड़े रीसेट करें",
  settings_saved: "सहेजा गया",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "स्किप किया",
  notice_undo: "पूर्ववत करें",
  notice_close: "बंद करें",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "घं",
  duration_minute_short: "मि",
  duration_second_short: "से",

  // About / legal.
  attribution: "सेगमेंट डेटा SponsorBlock (sponsor.ajay.app) द्वारा, CC BY-NC-SA 4.0 के तहत लाइसेंस प्राप्त।",
  not_affiliated: "यह एक निःशुल्क, गैर-व्यावसायिक, केवल-पठन क्लाइंट है और SponsorBlock या YouTube / Google से संबद्ध नहीं है, न ही इनके द्वारा समर्थित या निर्मित है।",
  privacy_note: "सेगमेंट खोजने के लिए SponsorBlock को वीडियो आईडी का केवल 4-अक्षर का हैश भेजा जाता है। हम कोई सर्वर, कोई एनालिटिक्स और कोई ट्रैकिंग नहीं चलाते। आपकी सेटिंग्स Chrome द्वारा संग्रहीत की जाती हैं और, यदि आपने Chrome Sync चालू किया है, तो आपके साइन-इन किए गए ब्राउज़रों में सिंक होती हैं; आंकड़े और चैनल व्हाइटलिस्ट इसी डिवाइस पर रहते हैं।"
};
