/**
 * shared/messages/ko.js — Korean UI strings for the in-page popup and options
 * runtime. This table mirrors the key set of shared/messages/en.js exactly
 * (same keys, same order); tests/i18n.test.mjs fails on drift.
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
  cat_sponsor: "스폰서",
  cat_selfpromo: "자기 홍보",
  cat_interaction: "알림 (좋아요 / 구독)",
  cat_intro: "인트로 / 막간",
  cat_outro: "아웃트로 / 엔드카드",
  cat_preview: "미리보기 / 요약",
  cat_filler: "군더더기 / 잡담",
  cat_music_offtopic: "음악 외 구간",
  cat_hook: "훅 / 인사말",

  // Popup.
  popup_enabled: "건너뛰기 사용",
  popup_categories: "건너뛸 구간",
  popup_skipped: "건너뛴 구간",
  popup_time_saved: "절약한 시간",
  popup_open_settings: "설정 더 보기",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "건너뜁니다:",
  popup_status_off: "건너뛰기가 꺼져 있습니다",
  popup_status_whitelisted: "이 채널은 허용 목록에 있습니다",
  popup_status_none: "아직 표시된 구간이 없습니다",
  popup_status_too_short: "켜진 구간이 최소 길이보다 짧습니다",
  popup_status_category_off: "이 구간 카테고리가 꺼져 있습니다",
  popup_status_error: "구간 데이터를 불러오지 못했습니다",
  popup_status_checking: "확인 중…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — 설정",
  tab_settings: "설정",
  tab_statistics: "통계",
  settings_general: "일반",
  settings_language: "인터페이스 언어",
  settings_enabled: "자동 건너뛰기 사용",
  settings_timeline_markers: "진행 바에 구간 마커 표시",
  settings_skip_notice: "실행 취소 버튼이 있는 건너뛰기 알림 표시",
  settings_categories: "건너뛸 카테고리",
  settings_min_length: "최소 구간 길이 (초)",
  settings_min_length_hint: "이보다 짧은 구간은 무시됩니다. 0 = 모두 건너뛰기.",
  settings_whitelist: "채널 허용 목록",
  settings_whitelist_hint: "이 채널에서는 건너뛰기가 비활성화됩니다. 채널 핸들(예: @channelname) 또는 channel/UC... 형식의 ID를 추가하세요.",
  settings_whitelist_add: "추가",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "허용 목록에 채널이 없습니다.",
  settings_remove: "삭제",
  settings_stats: "통계",
  settings_stats_count: "건너뛴 구간",
  settings_stats_time: "절약한 시간",
  settings_stats_reset: "통계 초기화",
  settings_saved: "저장됨",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "건너뜀",
  notice_undo: "실행 취소",
  notice_close: "닫기",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "시간",
  duration_minute_short: "분",
  duration_second_short: "초",

  // About / legal.
  attribution: "구간 데이터 제공: SponsorBlock (sponsor.ajay.app), CC BY-NC-SA 4.0 라이선스.",
  not_affiliated: "이 프로그램은 무료이며 비상업적인 읽기 전용 클라이언트로, SponsorBlock 또는 YouTube / Google과 제휴하거나 이들의 보증을 받거나 이들이 제작한 것이 아닙니다.",
  privacy_note: "구간을 조회하기 위해 영상 ID의 4자 해시만 SponsorBlock에 전송됩니다. 자체 서버, 분석 도구, 추적 기능은 일절 운영하지 않습니다. 설정은 Chrome에 저장되며, Chrome Sync를 켜 두었다면 로그인된 브라우저 간에 동기화됩니다. 통계와 채널 허용 목록은 이 기기에만 저장됩니다."
};
