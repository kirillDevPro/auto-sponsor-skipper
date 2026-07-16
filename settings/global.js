/**
 * settings/global.js — the General + Categories sections of the options page:
 * the master enable toggle, timeline-marker toggle, skip-notice toggle,
 * language selector, minimum-segment-length input, and per-category checkboxes.
 *
 * options_ui uses open_in_tab, so this page can live for a long time. Every
 * write is a read-fresh-modify-write via updateSettings so it can't clobber a
 * concurrent change from the popup, and a chrome.storage.onChanged listener
 * refreshes the controls when settings change elsewhere.
 */

import { CATEGORIES, SETTINGS_KEY } from "../shared/categories.js";
import { loadSettings, updateSettings } from "../shared/settingsStore.js";
import { t, localizePage, LANGUAGES, onLanguageChange } from "../shared/i18n.js";

/**
 * Briefly flash a "Saved" indicator next to the general controls.
 * @returns {void}
 * @sideEffects Toggles the indicator class and schedules its removal.
 */
function flashSaved() {
  const el = document.getElementById("general-saved");
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1200);
}

/**
 * Wire the General + Categories sections.
 * @returns {Promise<void>}
 * @sideEffects Reads/writes chrome.storage, builds category/language controls,
 *   adds DOM listeners, and registers storage/language-change listeners.
 */
export async function initGlobal() {
  let settings = await loadSettings();

  const langEl = document.getElementById("ui-language");
  const enabledEl = document.getElementById("enabled");
  const markersEl = document.getElementById("show-timeline-markers");
  const noticeEl = document.getElementById("show-skip-notice");
  const minEl = document.getElementById("min-length");
  const catsEl = document.getElementById("categories");

  /**
   * Push current settings into the controls (no rebuild of the rows). Skips the
   * element the user is currently editing so an external change arriving
   * mid-edit doesn't discard their uncommitted keystrokes.
   * @returns {void}
   * @sideEffects Updates form control values and checked states.
   */
  function syncControls() {
    const active = document.activeElement;
    if (active !== langEl) langEl.value = settings.language;
    if (active !== enabledEl) enabledEl.checked = settings.enabled;
    if (active !== markersEl) markersEl.checked = settings.showTimelineMarkers;
    if (active !== noticeEl) noticeEl.checked = settings.showSkipNotice;
    if (active !== minEl) minEl.value = String(settings.minSegmentLength || 0);
    for (const cat of CATEGORIES) {
      const input = document.getElementById("cat-" + cat.id);
      if (input && input !== active) input.checked = settings.categories[cat.id] === true;
    }
  }

  // Language selector: populate from the shipped languages (endonym labels),
  // reflect the stored choice, and persist on change. The write triggers
  // storage.onChanged -> onLanguageChange (below), which re-localizes the page.
  for (const { code, name } of LANGUAGES) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = name;
    langEl.append(opt);
  }
  langEl.value = settings.language;
  langEl.addEventListener("change", async () => {
    settings = await updateSettings((s) => {
      s.language = langEl.value;
    });
    flashSaved();
  });

  enabledEl.checked = settings.enabled;
  enabledEl.addEventListener("change", async () => {
    settings = await updateSettings((s) => {
      s.enabled = enabledEl.checked;
    });
    flashSaved();
  });

  markersEl.checked = settings.showTimelineMarkers;
  markersEl.addEventListener("change", async () => {
    settings = await updateSettings((s) => {
      s.showTimelineMarkers = markersEl.checked;
    });
    flashSaved();
  });

  noticeEl.checked = settings.showSkipNotice;
  noticeEl.addEventListener("change", async () => {
    settings = await updateSettings((s) => {
      s.showSkipNotice = noticeEl.checked;
    });
    flashSaved();
  });

  minEl.value = String(settings.minSegmentLength || 0);
  minEl.addEventListener("change", async () => {
    let v = parseInt(minEl.value, 10);
    if (!Number.isFinite(v) || v < 0) v = 0;
    minEl.value = String(v);
    settings = await updateSettings((s) => {
      s.minSegmentLength = v;
    });
    flashSaved();
  });

  catsEl.textContent = "";
  for (const cat of CATEGORIES) {
    const row = document.createElement("div");
    row.className = "cat";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = "cat-" + cat.id;
    input.checked = settings.categories[cat.id] === true;
    input.addEventListener("change", async () => {
      settings = await updateSettings((s) => {
        s.categories[cat.id] = input.checked;
      });
    });

    // A colored dot matching this category's timeline-marker color (single source:
    // shared/categories.js CATEGORIES[].color, the same field the markers use).
    const dot = document.createElement("span");
    dot.className = "cat-dot";
    dot.style.backgroundColor = cat.color;

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.dataset.i18n = cat.i18nKey;
    label.textContent = t(settings.language, cat.i18nKey);

    row.append(input, dot, label);
    catsEl.append(row);
  }

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === "sync" && changes[SETTINGS_KEY]) {
      settings = await loadSettings();
      syncControls();
    }
  });

  // Re-localize the static page + category labels (data-i18n) live when the
  // language changes — fires only on an actual settings.language change. Also
  // reflect it in the selector: syncControls skips langEl while it is focused,
  // which would otherwise leave the control out of step after an external change.
  onLanguageChange(settings.language, (lang) => {
    langEl.value = lang;
    localizePage(document, lang);
  });
}
