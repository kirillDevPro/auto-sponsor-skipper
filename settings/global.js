/**
 * settings/global.js — the General + Categories sections of the options page:
 * the master enable toggle, the timeline-marker toggle, the
 * minimum-segment-length input, and the per-category checkboxes.
 *
 * options_ui uses open_in_tab, so this page can live for a long time. Every
 * write is a read-fresh-modify-write via updateSettings so it can't clobber a
 * concurrent change from the popup, and a chrome.storage.onChanged listener
 * refreshes the controls when settings change elsewhere.
 */

import { CATEGORIES, SETTINGS_KEY } from "../shared/categories.js";
import { loadSettings, updateSettings } from "../shared/settingsStore.js";
import { t } from "./i18n.js";

/** Briefly flash a "Saved" indicator next to the general controls. */
function flashSaved() {
  const el = document.getElementById("general-saved");
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1200);
}

/** Wire the General + Categories sections. */
export async function initGlobal() {
  let settings = await loadSettings();

  const enabledEl = document.getElementById("enabled");
  const markersEl = document.getElementById("show-timeline-markers");
  const minEl = document.getElementById("min-length");
  const catsEl = document.getElementById("categories");

  /**
   * Push current settings into the controls (no rebuild of the rows). Skips the
   * element the user is currently editing so an external change arriving
   * mid-edit doesn't discard their uncommitted keystrokes.
   */
  function syncControls() {
    const active = document.activeElement;
    if (active !== enabledEl) enabledEl.checked = settings.enabled;
    if (active !== markersEl) markersEl.checked = settings.showTimelineMarkers;
    if (active !== minEl) minEl.value = String(settings.minSegmentLength || 0);
    for (const cat of CATEGORIES) {
      const input = document.getElementById("cat-" + cat.id);
      if (input && input !== active) input.checked = settings.categories[cat.id] === true;
    }
  }

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

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = t(cat.i18nKey);

    row.append(input, label);
    catsEl.append(row);
  }

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === "sync" && changes[SETTINGS_KEY]) {
      settings = await loadSettings();
      syncControls();
    }
  });
}
