/**
 * shared/messages/ja.js — Japanese UI strings for the in-page popup and options
 * runtime. Mirrors the key set of en.js exactly (same keys, same order);
 * tests/i18n.test.mjs fails on drift.
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
  cat_sponsor: "スポンサー",
  cat_selfpromo: "自己宣伝",
  cat_interaction: "催促（高評価・登録）",
  cat_intro: "イントロ / 幕間",
  cat_outro: "アウトロ / エンドカード",
  cat_preview: "プレビュー / 要約",
  cat_filler: "余談 / 脱線",
  cat_music_offtopic: "非音楽パート",
  cat_hook: "冒頭のフック / 挨拶",

  // Popup.
  popup_enabled: "スキップを有効にする",
  popup_categories: "スキップする区間",
  popup_skipped: "スキップした区間数",
  popup_time_saved: "節約した時間",
  popup_open_settings: "詳細設定",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "スキップ対象：",
  popup_status_off: "スキップは無効です",
  popup_status_whitelisted: "このチャンネルはホワイトリストに登録済みです",
  popup_status_none: "まだ区間が登録されていません",
  popup_status_too_short: "有効な区間が最小の長さに達していません",
  popup_status_category_off: "これらの区間カテゴリは無効です",
  popup_status_error: "区間データを読み込めませんでした",
  popup_status_checking: "確認中…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — 設定",
  tab_settings: "設定",
  tab_statistics: "統計",
  settings_general: "一般",
  settings_language: "インターフェース言語",
  settings_enabled: "自動スキップを有効にする",
  settings_timeline_markers: "シークバーに区間マーカーを表示",
  settings_skip_notice: "元に戻すボタン付きのスキップ通知を表示",
  settings_categories: "スキップするカテゴリ",
  settings_min_length: "区間の最小の長さ（秒）",
  settings_min_length_hint: "これより短い区間は無視されます。0 = すべてスキップ。",
  settings_whitelist: "チャンネルのホワイトリスト",
  settings_whitelist_hint: "これらのチャンネルではスキップを無効にします。チャンネルハンドル（例：@channelname）または channel/UC... 形式の ID を追加してください。",
  settings_whitelist_add: "追加",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "ホワイトリストに登録されたチャンネルはありません。",
  settings_remove: "削除",
  settings_stats: "統計",
  settings_stats_count: "スキップした区間数",
  settings_stats_time: "節約した時間",
  settings_stats_reset: "統計をリセット",
  settings_saved: "保存しました",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "スキップしました",
  notice_undo: "元に戻す",
  notice_close: "閉じる",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "時間",
  duration_minute_short: "分",
  duration_second_short: "秒",

  // About / legal.
  attribution: "区間データは SponsorBlock（sponsor.ajay.app）提供で、CC BY-NC-SA 4.0 のライセンスに基づいています。",
  not_affiliated: "本拡張機能は無料・非営利の読み取り専用クライアントであり、SponsorBlock や YouTube / Google と提携しておらず、これらによる承認や開発も受けていません。",
  privacy_note: "区間を照会するために、動画 ID の 4 文字のハッシュのみを SponsorBlock に送信します。当方はサーバー、アナリティクス、トラッキングを一切運用していません。設定は Chrome によって保存され、Chrome Sync を有効にしている場合はログイン中のブラウザ間で同期されます。統計とチャンネルのホワイトリストはこの端末内にとどまります。"
};
