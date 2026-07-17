/**
 * shared/messages/zh_CN.js — Chinese (Simplified) UI strings. Mirrors the key
 * set of shared/messages/en.js exactly (same keys, same order);
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
  cat_sponsor: "赞助广告",
  cat_selfpromo: "自我推广",
  cat_interaction: "互动提醒（点赞 / 订阅）",
  cat_intro: "片头 / 过场",
  cat_outro: "片尾 / 推荐卡片",
  cat_preview: "预览 / 回顾",
  cat_filler: "闲聊 / 离题内容",
  cat_music_offtopic: "非音乐部分",
  cat_hook: "开场悬念 / 问候",

  // Popup.
  popup_enabled: "启用跳过",
  popup_categories: "跳过这些片段",
  popup_skipped: "已跳过片段",
  popup_time_saved: "节省时间",
  popup_open_settings: "更多设置",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "将跳过：",
  popup_status_off: "跳过功能已关闭",
  popup_status_whitelisted: "该频道已加入白名单",
  popup_status_none: "尚无标记的片段",
  popup_status_too_short: "已启用的片段短于您设定的最小长度",
  popup_status_category_off: "这些片段类别已关闭",
  popup_status_error: "无法加载片段数据",
  popup_status_checking: "检查中…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — 设置",
  tab_settings: "设置",
  tab_statistics: "统计",
  settings_general: "常规",
  settings_language: "语言",
  settings_enabled: "启用自动跳过",
  settings_timeline_markers: "在进度条上显示片段标记",
  settings_skip_notice: "显示带撤销按钮的跳过提示",
  settings_categories: "要跳过的类别",
  settings_min_length: "最小片段长度（秒）",
  settings_min_length_hint: "短于此长度的片段将被忽略。0 = 全部跳过。",
  settings_whitelist: "频道白名单",
  settings_whitelist_hint: "在这些频道上不会跳过。请添加频道句柄（例如 @channelname）或 channel/UC... 形式的 ID。",
  settings_whitelist_add: "添加",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "白名单中暂无频道。",
  settings_remove: "移除",
  settings_stats: "统计",
  settings_stats_count: "已跳过片段",
  settings_stats_time: "节省时间",
  settings_stats_reset: "重置统计",
  settings_saved: "已保存",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "已跳过",
  notice_undo: "撤销",
  notice_close: "关闭",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "时",
  duration_minute_short: "分",
  duration_second_short: "秒",

  // About / legal.
  attribution: "片段数据由 SponsorBlock (sponsor.ajay.app) 提供，采用 CC BY-NC-SA 4.0 许可。",
  not_affiliated: "本扩展是免费、非商业的只读客户端，与 SponsorBlock 或 YouTube / Google 无关联，未获其认可，也并非由其创建。",
  privacy_note: "仅将视频 ID 的 4 个字符哈希发送给 SponsorBlock 以查询片段。我们不运行任何服务器，不做分析统计，也不进行跟踪。您的设置由 Chrome 存储；若您开启了 Chrome Sync，设置会在您已登录的浏览器之间同步；统计数据和频道白名单则仅保留在本设备上。"
};
