/**
 * popup/popup.js — the toolbar popup. Master on/off, per-category checkboxes
 * (from the shared catalog), and the skip counter. Every change is a
 * read-fresh-modify-write via updateSettings so a change here can't clobber a
 * concurrent edit made in an open options tab; a chrome.storage.onChanged
 * listener keeps the popup's own controls in sync if storage changes elsewhere.
 * There is no popup-to-content messaging and no `tabs` permission — the content
 * script's own onChanged listener applies settings live.
 */

import { CATEGORIES, SETTINGS_KEY, STATS_KEY } from "../shared/categories.js";
import { loadSettings, updateSettings, loadStats } from "../shared/settingsStore.js";
import { t, localizePage } from "./i18n.js";

const enabledEl = document.getElementById("enabled");
const categoriesEl = document.getElementById("categories");
const countEl = document.getElementById("skipped-count");

let settings;

/** Reflect the master-enabled state (dims the categories when off). */
function renderEnabled() {
  enabledEl.checked = settings.enabled;
  document.body.classList.toggle("disabled", !settings.enabled);
}

/** Sync each category checkbox to the current settings (no rebuild). */
function syncCategoryChecks() {
  for (const cat of CATEGORIES) {
    const input = document.getElementById("cat-" + cat.id);
    if (input) input.checked = settings.categories[cat.id] === true;
  }
}

/** Build one checkbox row per category. */
function renderCategories() {
  categoriesEl.textContent = "";
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
    categoriesEl.append(row);
  }
}

async function init() {
  localizePage();
  settings = await loadSettings();
  const stats = await loadStats();
  countEl.textContent = String(stats.count || 0);

  renderEnabled();
  renderCategories();

  enabledEl.addEventListener("change", async () => {
    settings = await updateSettings((s) => {
      s.enabled = enabledEl.checked;
    });
    document.body.classList.toggle("disabled", !settings.enabled);
  });

  document.getElementById("open-settings").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Keep the popup's controls in sync if settings/stats change elsewhere.
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === "sync" && changes[SETTINGS_KEY]) {
      settings = await loadSettings();
      renderEnabled();
      syncCategoryChecks();
    }
    if (area === "local" && changes[STATS_KEY]) {
      const s = changes[STATS_KEY].newValue || { count: 0 };
      countEl.textContent = String(s.count || 0);
    }
  });
}

init();
