/**
 * shared/messages/tr.js — Turkish UI strings for the in-page popup and options
 * runtime. Mirrors the key set of en.js exactly (same keys, same order);
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
  cat_sponsor: "Sponsor",
  cat_selfpromo: "Kendi tanıtımı",
  cat_interaction: "Hatırlatmalar (beğen / abone ol)",
  cat_intro: "Giriş / ara",
  cat_outro: "Kapanış / bitiş kartları",
  cat_preview: "Önizleme / özet",
  cat_filler: "Dolgu / konu dışı",
  cat_music_offtopic: "Müzik dışı bölüm",
  cat_hook: "Merak kancası / karşılama",

  // Popup.
  popup_enabled: "Atlama etkin",
  popup_categories: "Şu bölümleri atla",
  popup_skipped: "Atlanan bölümler",
  popup_time_saved: "Kazanılan süre",
  popup_open_settings: "Diğer ayarlar",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Atlanacak:",
  popup_status_off: "Atlama kapalı",
  popup_status_whitelisted: "Bu kanal beyaz listede",
  popup_status_none: "Henüz işaretlenmiş bölüm yok",
  popup_status_too_short: "Etkin bölümler minimum uzunluğunuzun altında",
  popup_status_category_off: "Bu bölüm kategorileri kapalı",
  popup_status_error: "Bölüm verileri yüklenemedi",
  popup_status_checking: "Kontrol ediliyor…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Ayarlar",
  tab_settings: "Ayarlar",
  tab_statistics: "İstatistikler",
  settings_general: "Genel",
  settings_language: "Arayüz dili",
  settings_enabled: "Otomatik atlamayı etkinleştir",
  settings_timeline_markers: "Bölüm işaretlerini ilerleme çubuğunda göster",
  settings_skip_notice: "Geri al düğmeli atlama bildirimi göster",
  settings_categories: "Atlanacak kategoriler",
  settings_min_length: "Minimum bölüm uzunluğu (saniye)",
  settings_min_length_hint: "Bundan kısa bölümler yok sayılır. 0 = tümünü atla.",
  settings_whitelist: "Kanal beyaz listesi",
  settings_whitelist_hint: "Bu kanallarda atlama devre dışı bırakılır. Bir kanal adı (örn. @channelname) veya channel/UC... kimliği ekleyin.",
  settings_whitelist_add: "Ekle",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Beyaz listede kanal yok.",
  settings_remove: "Kaldır",
  settings_stats: "İstatistikler",
  settings_stats_count: "Atlanan bölümler",
  settings_stats_time: "Kazanılan süre",
  settings_stats_reset: "İstatistikleri sıfırla",
  settings_saved: "Kaydedildi",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Atlandı",
  notice_undo: "Geri al",
  notice_close: "Kapat",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "sa",
  duration_minute_short: "dk",
  duration_second_short: "sn",

  // About / legal.
  attribution: "Bölüm verileri SponsorBlock (sponsor.ajay.app) tarafından sağlanmaktadır ve CC BY-NC-SA 4.0 ile lisanslanmıştır.",
  not_affiliated: "Bu, ücretsiz, ticari olmayan, salt okunur bir istemcidir; SponsorBlock veya YouTube / Google ile bağlantılı değildir, onlar tarafından desteklenmemekte veya oluşturulmamıştır.",
  privacy_note: "Bölümleri aramak için SponsorBlock'a yalnızca video kimliğinin 4 karakterlik bir karması gönderilir. Hiçbir sunucu, analiz veya takip kullanmıyoruz. Ayarlarınız Chrome tarafından saklanır ve Chrome Sync açıksa oturum açtığınız tarayıcılar arasında senkronize edilir; istatistikler ve kanal beyaz listesi bu cihazda kalır."
};
