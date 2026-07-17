/**
 * shared/messages/lt.js — Lithuanian UI strings for the in-page popup and
 * options runtime. This table MUST mirror the key set of en.js exactly (same
 * keys, same order); tests/i18n.test.mjs fails on drift.
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
  cat_sponsor: "Rėmėjas",
  cat_selfpromo: "Savireklama",
  cat_interaction: "Priminimai (patinka / prenumeruoti)",
  cat_intro: "Įžanga / pertraukėlė",
  cat_outro: "Pabaiga / baigiamosios kortelės",
  cat_preview: "Anonsas / santrauka",
  cat_filler: "Užpildas / nukrypimas",
  cat_music_offtopic: "Ne muzikos dalis",
  cat_hook: "Užkaba / pasisveikinimas",

  // Popup.
  popup_enabled: "Praleidimas įjungtas",
  popup_categories: "Praleisti šiuos segmentus",
  popup_skipped: "Praleista segmentų",
  popup_time_saved: "Sutaupyta laiko",
  popup_open_settings: "Daugiau nustatymų",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Bus praleista:",
  popup_status_off: "Praleidimas išjungtas",
  popup_status_whitelisted: "Šis kanalas įtrauktas į baltąjį sąrašą",
  popup_status_none: "Segmentų dar nepažymėta",
  popup_status_too_short: "Įjungti segmentai trumpesni už jūsų nurodytą mažiausią ilgį",
  popup_status_category_off: "Šių segmentų kategorijos išjungtos",
  popup_status_error: "Nepavyko įkelti segmentų duomenų",
  popup_status_checking: "Tikrinama…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Nustatymai",
  tab_settings: "Nustatymai",
  tab_statistics: "Statistika",
  settings_general: "Bendra",
  settings_language: "Sąsajos kalba",
  settings_enabled: "Įjungti automatinį praleidimą",
  settings_timeline_markers: "Rodyti segmentų žymes eigos juostoje",
  settings_skip_notice: "Rodyti praleidimo pranešimą su atšaukimo mygtuku",
  settings_categories: "Praleidžiamos kategorijos",
  settings_min_length: "Mažiausias segmento ilgis (sekundėmis)",
  settings_min_length_hint: "Trumpesni segmentai ignoruojami. 0 = praleisti visus.",
  settings_whitelist: "Kanalų baltasis sąrašas",
  settings_whitelist_hint: "Šiuose kanaluose praleidimas išjungtas. Pridėkite kanalo vardą (pvz., @channelname) arba channel/UC... id.",
  settings_whitelist_add: "Pridėti",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Baltajame sąraše kanalų nėra.",
  settings_remove: "Šalinti",
  settings_stats: "Statistika",
  settings_stats_count: "Praleista segmentų",
  settings_stats_time: "Sutaupyta laiko",
  settings_stats_reset: "Atstatyti statistiką",
  settings_saved: "Išsaugota",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Praleista",
  notice_undo: "Atšaukti",
  notice_close: "Užverti",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "val",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Segmentų duomenis teikia SponsorBlock (sponsor.ajay.app), licencijuota pagal CC BY-NC-SA 4.0.",
  not_affiliated: "Tai nemokamas, nekomercinis, tik skaitantis klientas; jis nėra susijęs su SponsorBlock ar YouTube / Google, jų neremiamas ir ne jų sukurtas.",
  privacy_note: "Segmentams surasti į SponsorBlock siunčiama tik 4 simbolių vaizdo įrašo ID maiša. Mes neturime serverių, nerenkame analitikos ir nevykdome sekimo. Jūsų nustatymus saugo Chrome ir, jei įjungtas Chrome Sync, jie sinchronizuojami tarp jūsų naršyklių, kuriose esate prisijungę; statistika ir kanalų baltasis sąrašas lieka šiame įrenginyje."
};
