/**
 * shared/messages/en.js — English UI strings (the source-of-truth locale for the
 * in-page popup and options runtime). Every table in this folder — one per code
 * in shared/languages.js — MUST carry this exact key set, in this order;
 * tests/i18n.test.mjs fails on drift.
 *
 * These are the IN-PAGE strings only. The manifest name/description live
 * separately in _locales/ (native chrome.i18n, browser-locale for the Chrome
 * Web Store listing). `extName` is intentionally in BOTH places: the popup <h1>
 * localizes it in-page, the manifest localizes it for chrome://extensions.
 * `extName` is a brand name — byte-identical in every shipped table, never
 * translated (tests/localeQuality.test.mjs enforces it, along with the tokens
 * that must survive translation verbatim: the license id, sponsor.ajay.app,
 * @channelname, and the em-dash title prefix).
 */

export default {
  extName: "Auto Sponsor Skipper",

  // SponsorBlock skip categories (keys match CATEGORIES[].i18nKey).
  cat_sponsor: "Sponsor",
  cat_selfpromo: "Self-promotion",
  cat_interaction: "Reminders (like / subscribe)",
  cat_intro: "Intro / intermission",
  cat_outro: "Outro / endcards",
  cat_preview: "Preview / recap",
  cat_filler: "Filler / tangent",
  cat_music_offtopic: "Non-music section",
  cat_hook: "Hook / greeting",

  // Popup.
  popup_enabled: "Skipping enabled",
  popup_categories: "Skip these segments",
  popup_skipped: "Segments skipped",
  popup_time_saved: "Time saved",
  popup_open_settings: "More settings",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Will skip:",
  popup_status_off: "Skipping is turned off",
  popup_status_whitelisted: "This channel is whitelisted",
  popup_status_none: "No segments marked yet",
  popup_status_too_short: "Enabled segments are below your minimum length",
  popup_status_category_off: "These segment categories are turned off",
  popup_status_error: "Couldn't load segment data",
  popup_status_checking: "Checking…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Settings",
  tab_settings: "Settings",
  tab_statistics: "Statistics",
  settings_general: "General",
  settings_language: "Language",
  settings_enabled: "Enable automatic skipping",
  settings_timeline_markers: "Show segment markers on the progress bar",
  settings_skip_notice: "Show a skip notice with an undo button",
  settings_categories: "Categories to skip",
  settings_min_length: "Minimum segment length (seconds)",
  settings_min_length_hint: "Segments shorter than this are ignored. 0 = skip all.",
  settings_whitelist: "Channel whitelist",
  settings_whitelist_hint: "Skipping is disabled on these channels. Add a channel handle (e.g. @channelname) or channel/UC... id.",
  settings_whitelist_add: "Add",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "No channels whitelisted.",
  settings_remove: "Remove",
  settings_stats: "Statistics",
  settings_stats_count: "Segments skipped",
  settings_stats_time: "Time saved",
  settings_stats_reset: "Reset statistics",
  settings_saved: "Saved",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Skipped",
  notice_undo: "Undo",
  notice_close: "Dismiss",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "m",
  duration_second_short: "s",

  // About / legal.
  attribution: "Segment data by SponsorBlock (sponsor.ajay.app), licensed CC BY-NC-SA 4.0.",
  not_affiliated: "This is a free, non-commercial, read-only client and is not affiliated with, endorsed by, or created by SponsorBlock or YouTube / Google.",
  privacy_note: "Only a 4-character hash of the video ID is sent to SponsorBlock to look up segments. We run no servers, no analytics, and no tracking. Your settings are stored by Chrome and, if you have Chrome Sync turned on, synced across your signed-in browsers; statistics and the channel whitelist stay on this device."
};
